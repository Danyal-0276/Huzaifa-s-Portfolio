from __future__ import annotations

import csv
import hashlib
import json
import math
import os
import re
import statistics
import subprocess
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Any

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
VIDEO_DIR = ROOT / "portfolio"
REVIEW_DIR = ROOT / "review"
FRAME_DIR = REVIEW_DIR / "frames"
SAMPLE_DIR = REVIEW_DIR / "sample-frames"

DEFAULT_FFMPEG_DIR = Path(
    r"C:\Users\DONI BUTT\AppData\Local\Temp\opencode\ffmpeg-win64-lgpl-shared"
    r"\ffmpeg-N-128909-g604ef3784d-win64-lgpl-shared\bin"
)
FFMPEG_DIR = Path(os.environ.get("FFMPEG_DIR", DEFAULT_FFMPEG_DIR))
FFMPEG = FFMPEG_DIR / "ffmpeg.exe"
FFPROBE = FFMPEG_DIR / "ffprobe.exe"

VIDEO_SUFFIXES = {".mp4", ".mov", ".m4v", ".avi", ".mkv", ".webm"}
CONTACT_POINTS = (0.05, 0.50, 0.95)
SAMPLE_POINTS = (0.05, 0.1625, 0.275, 0.3875, 0.50, 0.6125, 0.725, 0.8375, 0.95)


def natural_key(path: Path) -> list[Any]:
    return [int(part) if part.isdigit() else part.lower() for part in re.split(r"(\d+)", path.name)]


def run_text(command: list[str], timeout: int = 3600) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        command,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=timeout,
        check=False,
    )


def parse_fraction(value: str | None) -> float:
    if not value or value in {"0/0", "N/A"}:
        return 0.0
    if "/" in value:
        numerator, denominator = value.split("/", 1)
        try:
            return float(numerator) / float(denominator)
        except (ValueError, ZeroDivisionError):
            return 0.0
    try:
        return float(value)
    except ValueError:
        return 0.0


def safe_float(value: Any) -> float | None:
    try:
        result = float(value)
    except (TypeError, ValueError):
        return None
    return result if math.isfinite(result) else None


def probe_video(path: Path) -> dict[str, Any]:
    result = run_text(
        [
            str(FFPROBE),
            "-v",
            "error",
            "-print_format",
            "json",
            "-show_format",
            "-show_streams",
            str(path),
        ],
        timeout=300,
    )
    if result.returncode != 0:
        raise RuntimeError(f"ffprobe failed for {path.name}: {result.stderr.strip()}")

    payload = json.loads(result.stdout)
    streams = payload.get("streams", [])
    video_stream = next((stream for stream in streams if stream.get("codec_type") == "video"), None)
    audio_streams = [stream for stream in streams if stream.get("codec_type") == "audio"]
    if not video_stream:
        raise RuntimeError(f"No video stream found in {path.name}")

    coded_width = int(video_stream.get("width") or 0)
    coded_height = int(video_stream.get("height") or 0)
    rotation = 0
    for side_data in video_stream.get("side_data_list", []):
        if side_data.get("rotation") is not None:
            rotation = int(side_data["rotation"])
            break
    if not rotation:
        try:
            rotation = int(video_stream.get("tags", {}).get("rotate", 0))
        except ValueError:
            rotation = 0

    if abs(rotation) % 180 == 90:
        width, height = coded_height, coded_width
    else:
        width, height = coded_width, coded_height

    if abs(width - height) / max(width, height, 1) <= 0.05:
        orientation = "square"
    elif width > height:
        orientation = "horizontal"
    else:
        orientation = "vertical"

    format_data = payload.get("format", {})
    duration = safe_float(format_data.get("duration"))
    if duration is None:
        duration = safe_float(video_stream.get("duration")) or 0.0

    fps = parse_fraction(video_stream.get("avg_frame_rate"))
    if fps <= 0:
        fps = parse_fraction(video_stream.get("r_frame_rate"))

    format_bitrate = safe_float(format_data.get("bit_rate"))
    video_bitrate = safe_float(video_stream.get("bit_rate"))
    if video_bitrate is None and format_bitrate is not None:
        known_audio_bitrate = sum(safe_float(stream.get("bit_rate")) or 0 for stream in audio_streams)
        video_bitrate = max(0.0, format_bitrate - known_audio_bitrate)

    return {
        "filename": path.name,
        "path": str(path),
        "duration_seconds": duration,
        "coded_width": coded_width,
        "coded_height": coded_height,
        "width": width,
        "height": height,
        "resolution": f"{width}x{height}",
        "fps": fps,
        "orientation": orientation,
        "codec": str(video_stream.get("codec_name") or "unknown"),
        "pixel_format": str(video_stream.get("pix_fmt") or "unknown"),
        "format_bitrate_bps": format_bitrate,
        "video_bitrate_bps": video_bitrate,
        "file_size_bytes": path.stat().st_size,
        "has_audio": bool(audio_streams),
        "audio_codec": str(audio_streams[0].get("codec_name") or "unknown") if audio_streams else None,
        "audio_channels": int(audio_streams[0].get("channels") or 0) if audio_streams else 0,
        "rotation": rotation,
    }


BLACK_PATTERN = re.compile(
    r"black_start:(?P<start>-?[\d.]+)\s+black_end:(?P<end>-?[\d.]+)\s+black_duration:(?P<duration>[\d.]+)"
)


def scan_black_frames(item: dict[str, Any]) -> list[dict[str, float]]:
    result = run_text(
        [
            str(FFMPEG),
            "-hide_banner",
            "-nostats",
            "-threads",
            "2",
            "-i",
            item["path"],
            "-map",
            "0:v:0",
            "-vf",
            "scale=320:-2,blackdetect=d=0.50:pic_th=0.98:pix_th=0.10",
            "-an",
            "-f",
            "null",
            "-",
        ],
        timeout=7200,
    )
    output = result.stderr
    return [
        {key: float(value) for key, value in match.groupdict().items()}
        for match in BLACK_PATTERN.finditer(output)
    ]


def parse_loudnorm(stderr: str) -> dict[str, float | None]:
    blocks = re.findall(r'\{\s*"input_i".*?\}', stderr, flags=re.DOTALL)
    if not blocks:
        return {}
    try:
        payload = json.loads(blocks[-1])
    except json.JSONDecodeError:
        return {}
    wanted = ("input_i", "input_tp", "input_lra", "input_thresh", "target_offset")
    return {key: safe_float(payload.get(key)) for key in wanted}


def scan_audio(item: dict[str, Any]) -> dict[str, Any]:
    if not item["has_audio"]:
        return {"silences": [], "loudness": {}}

    result = run_text(
        [
            str(FFMPEG),
            "-hide_banner",
            "-nostats",
            "-threads",
            "2",
            "-i",
            item["path"],
            "-map",
            "0:a:0",
            "-vn",
            "-af",
            "silencedetect=noise=-50dB:d=5,loudnorm=I=-14:TP=-1:LRA=11:print_format=json",
            "-f",
            "null",
            "-",
        ],
        timeout=7200,
    )
    stderr = result.stderr
    starts = [float(value) for value in re.findall(r"silence_start:\s*(-?[\d.]+)", stderr)]
    endings = [
        (float(end), float(duration))
        for end, duration in re.findall(
            r"silence_end:\s*(-?[\d.]+)\s*\|\s*silence_duration:\s*([\d.]+)", stderr
        )
    ]
    silences: list[dict[str, float]] = []
    for index, (end, duration) in enumerate(endings):
        start = starts[index] if index < len(starts) else end - duration
        silences.append({"start": start, "end": end, "duration": duration})
    return {"silences": silences, "loudness": parse_loudnorm(stderr)}


def extract_frame(source: str, time_seconds: float, output: Path, max_side: int = 960) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    result = run_text(
        [
            str(FFMPEG),
            "-hide_banner",
            "-loglevel",
            "error",
            "-ss",
            f"{max(time_seconds, 0):.3f}",
            "-i",
            source,
            "-map",
            "0:v:0",
            "-frames:v",
            "1",
            "-vf",
            f"scale={max_side}:{max_side}:force_original_aspect_ratio=decrease",
            "-q:v",
            "2",
            "-y",
            str(output),
        ],
        timeout=600,
    )
    if result.returncode != 0 or not output.exists():
        raise RuntimeError(f"Frame extraction failed for {Path(source).name}: {result.stderr.strip()}")


def extract_review_frames(item: dict[str, Any]) -> dict[str, Any]:
    duration = item["duration_seconds"]
    stem = Path(item["filename"]).stem
    contact: list[dict[str, Any]] = []
    samples: list[dict[str, Any]] = []

    for index, fraction in enumerate(SAMPLE_POINTS):
        time_seconds = min(max(duration * fraction, 0.05), max(duration - 0.05, 0.05))
        output = SAMPLE_DIR / f"{stem}-{index + 1:02d}.jpg"
        extract_frame(item["path"], time_seconds, output)
        samples.append({"fraction": fraction, "time": time_seconds, "path": str(output)})

    contact_indices = (0, 4, 8)
    labels = ("START", "MIDDLE", "END")
    for label, sample_index in zip(labels, contact_indices):
        sample = samples[sample_index]
        output = FRAME_DIR / f"{stem}-{label.lower()}.jpg"
        with Image.open(sample["path"]) as image:
            image.convert("RGB").save(output, quality=92, optimize=True)
        contact.append({"label": label, "time": sample["time"], "path": str(output)})

    return {"contact_frames": contact, "sample_frames": samples}


def dhash(path: str) -> int:
    with Image.open(path) as source:
        image = ImageOps.exif_transpose(source).convert("L").resize((9, 8), Image.Resampling.LANCZOS)
        pixels = list(image.getdata())
    result = 0
    for y in range(8):
        row = y * 9
        for x in range(8):
            result = (result << 1) | int(pixels[row + x] > pixels[row + x + 1])
    return result


def image_variance(path: str) -> float:
    with Image.open(path) as source:
        pixels = list(source.convert("L").resize((32, 32), Image.Resampling.BOX).getdata())
    return statistics.pvariance(pixels) if pixels else 0.0


def compare_signatures(first: list[int], second: list[int]) -> dict[str, Any]:
    if not first or not second:
        return {"short_coverage": 0.0, "long_coverage": 0.0, "matches": 0, "mean_nearest": 64.0}
    short, long = (first, second) if len(first) <= len(second) else (second, first)
    short_distances = [min((value ^ other).bit_count() for other in long) for value in short]
    long_distances = [min((value ^ other).bit_count() for other in short) for value in long]
    return {
        "short_coverage": sum(distance <= 9 for distance in short_distances) / len(short_distances),
        "long_coverage": sum(distance <= 9 for distance in long_distances) / len(long_distances),
        "matches": sum(distance <= 9 for distance in short_distances),
        "mean_nearest": statistics.fmean(short_distances),
    }


def duplicate_pairs(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    signatures: dict[str, list[int]] = {}
    for item in items:
        hashes = [
            dhash(sample["path"])
            for sample in item["sample_frames"]
            if image_variance(sample["path"]) >= 80
        ]
        signatures[item["filename"]] = hashes

    pairs: list[dict[str, Any]] = []
    for first_index, first in enumerate(items):
        for second in items[first_index + 1 :]:
            similarity = compare_signatures(
                signatures[first["filename"]], signatures[second["filename"]]
            )
            minimum_samples = min(
                len(signatures[first["filename"]]), len(signatures[second["filename"]])
            )
            needed_matches = 2 if minimum_samples <= 3 else 3
            if similarity["matches"] < needed_matches or similarity["short_coverage"] < 0.34:
                continue
            if similarity["short_coverage"] >= 0.67:
                assessment = "likely duplicate or alternate cut"
            else:
                assessment = "possible same project / near-duplicate"
            pairs.append(
                {
                    "files": [first["filename"], second["filename"]],
                    "assessment": assessment,
                    **similarity,
                }
            )
    return sorted(pairs, key=lambda pair: pair["short_coverage"], reverse=True)


def under_1080p(item: dict[str, Any]) -> bool:
    width, height = item["width"], item["height"]
    if item["orientation"] == "horizontal":
        return width < 1920 or height < 1080
    if item["orientation"] == "vertical":
        return width < 1080 or height < 1920
    return min(width, height) < 1080


def very_low_bitrate(item: dict[str, Any]) -> tuple[bool, float | None]:
    bitrate = item.get("video_bitrate_bps")
    fps = item.get("fps") or 0
    pixels = item.get("width", 0) * item.get("height", 0)
    if not bitrate or fps <= 0 or pixels <= 0:
        return False, None
    bits_per_pixel_frame = bitrate / (pixels * fps)
    efficient_codecs = {"hevc", "h265", "av1", "vp9"}
    threshold = 0.009 if item["codec"].lower() in efficient_codecs else 0.018
    return bits_per_pixel_frame < threshold, bits_per_pixel_frame


def summarize_issues(item: dict[str, Any]) -> list[str]:
    issues: list[str] = []
    if under_1080p(item):
        issues.append(f"under 1080p ({item['resolution']})")

    low_bitrate, bpp = very_low_bitrate(item)
    item["bits_per_pixel_frame"] = bpp
    if low_bitrate:
        bitrate_mbps = (item.get("video_bitrate_bps") or 0) / 1_000_000
        issues.append(f"very low bitrate for frame size ({bitrate_mbps:.2f} Mbps)")

    if item["duration_seconds"] > 180:
        issues.append(f"very long runtime ({format_duration(item['duration_seconds'])})")

    if not item["has_audio"]:
        issues.append("no audio track")
    else:
        silences = item.get("silences", [])
        if silences:
            longest = max(segment["duration"] for segment in silences)
            issues.append(f"long silence detected ({longest:.1f}s longest)")

        loudness = item.get("loudness", {})
        integrated = loudness.get("input_i")
        true_peak = loudness.get("input_tp")
        if integrated is not None and integrated > -8:
            issues.append(f"extremely loud master ({integrated:.1f} LUFS)")
        elif integrated is not None and integrated < -30:
            issues.append(f"extremely quiet master ({integrated:.1f} LUFS)")
        if true_peak is not None and true_peak >= -0.1:
            issues.append(f"possible clipping / hot true peak ({true_peak:.1f} dBTP)")

    black_segments = item.get("black_segments", [])
    if black_segments:
        duration = item["duration_seconds"]
        leading = [segment for segment in black_segments if segment["start"] <= 0.2]
        trailing = [segment for segment in black_segments if segment["end"] >= duration - 0.2]
        interior = [
            segment for segment in black_segments if segment not in leading and segment not in trailing
        ]
        if leading:
            issues.append(f"leading black ({max(segment['duration'] for segment in leading):.1f}s)")
        if interior:
            issues.append(
                f"interior black frames ({len(interior)} segment{'s' if len(interior) != 1 else ''}, "
                f"{max(segment['duration'] for segment in interior):.1f}s longest)"
            )
        if trailing:
            issues.append(f"trailing black ({max(segment['duration'] for segment in trailing):.1f}s)")
    return issues


def format_duration(seconds: float) -> str:
    rounded = int(round(seconds))
    minutes, remainder = divmod(rounded, 60)
    hours, minutes = divmod(minutes, 60)
    if hours:
        return f"{hours}:{minutes:02d}:{remainder:02d}"
    return f"{minutes}:{remainder:02d}"


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        Path(r"C:\Windows\Fonts\seguisb.ttf" if bold else r"C:\Windows\Fonts\segoeui.ttf"),
        Path(r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size=size)
    return ImageFont.load_default()


def make_contact_sheet(items: list[dict[str, Any]]) -> None:
    label_width = 190
    cell_width, cell_height = 320, 240
    gutter = 16
    row_height = 282
    header_height = 110
    width = label_width + (cell_width * 3) + (gutter * 4)
    height = header_height + row_height * len(items) + 24
    canvas = Image.new("RGB", (width, height), "#090909")
    draw = ImageDraw.Draw(canvas)
    title_font = load_font(30, bold=True)
    subtitle_font = load_font(16)
    filename_font = load_font(24, bold=True)
    meta_font = load_font(14)
    frame_label_font = load_font(15, bold=True)

    draw.text((24, 20), "Portfolio video review — contact sheet", fill="#f6f6f6", font=title_font)
    draw.text(
        (24, 63),
        "Frames sampled near 5%, 50%, and 95% of each runtime (start / middle / end)",
        fill="#a8a8a8",
        font=subtitle_font,
    )

    for row_index, item in enumerate(items):
        row_top = header_height + row_index * row_height
        row_color = "#101010" if row_index % 2 == 0 else "#141414"
        draw.rectangle((8, row_top, width - 8, row_top + row_height - 8), fill=row_color)
        draw.text((24, row_top + 34), item["filename"], fill="#ffffff", font=filename_font)
        metadata = (
            f"{format_duration(item['duration_seconds'])}\n"
            f"{item['resolution']}\n"
            f"{item['orientation']}"
        )
        draw.multiline_text(
            (24, row_top + 78), metadata, fill="#aaaeb3", font=meta_font, spacing=7
        )

        for frame_index, frame in enumerate(item["contact_frames"]):
            left = label_width + gutter + frame_index * (cell_width + gutter)
            top = row_top + 20
            draw.rectangle(
                (left, top, left + cell_width, top + cell_height),
                fill="#020202",
                outline="#343434",
                width=1,
            )
            with Image.open(frame["path"]) as source:
                image = ImageOps.contain(
                    ImageOps.exif_transpose(source).convert("RGB"),
                    (cell_width - 4, cell_height - 34),
                    Image.Resampling.LANCZOS,
                )
            image_left = left + (cell_width - image.width) // 2
            image_top = top + 31 + (cell_height - 34 - image.height) // 2
            canvas.paste(image, (image_left, image_top))
            time_label = f"{frame['label']}  ·  {format_duration(frame['time'])}"
            draw.text((left + 10, top + 7), time_label, fill="#dedede", font=frame_label_font)

    output = REVIEW_DIR / "contact-sheet.jpg"
    canvas.save(output, quality=91, optimize=True, progressive=True)


def write_inventory(items: list[dict[str, Any]]) -> None:
    output = REVIEW_DIR / "inventory.csv"
    with output.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=[
                "filename",
                "duration_seconds",
                "resolution",
                "fps",
                "orientation",
                "codec",
                "bitrate_kbps",
                "file_size_mb",
                "has_audio",
            ],
        )
        writer.writeheader()
        for item in items:
            writer.writerow(
                {
                    "filename": item["filename"],
                    "duration_seconds": f"{item['duration_seconds']:.3f}",
                    "resolution": item["resolution"],
                    "fps": f"{item['fps']:.3f}",
                    "orientation": item["orientation"],
                    "codec": item["codec"],
                    "bitrate_kbps": (
                        f"{item['format_bitrate_bps'] / 1000:.0f}"
                        if item["format_bitrate_bps"] is not None
                        else ""
                    ),
                    "file_size_mb": f"{item['file_size_bytes'] / (1024 * 1024):.2f}",
                    "has_audio": "yes" if item["has_audio"] else "no",
                }
            )


def sha256(path: str) -> str:
    digest = hashlib.sha256()
    with open(path, "rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def exact_duplicate_pairs(items: list[dict[str, Any]]) -> list[list[str]]:
    by_size: dict[int, list[dict[str, Any]]] = {}
    for item in items:
        by_size.setdefault(item["file_size_bytes"], []).append(item)
    pairs: list[list[str]] = []
    for same_size in by_size.values():
        if len(same_size) < 2:
            continue
        by_hash: dict[str, list[str]] = {}
        for item in same_size:
            by_hash.setdefault(sha256(item["path"]), []).append(item["filename"])
        pairs.extend(files for files in by_hash.values() if len(files) > 1)
    return pairs


def main() -> None:
    if not FFMPEG.exists() or not FFPROBE.exists():
        raise SystemExit(f"FFmpeg tools not found in {FFMPEG_DIR}")

    REVIEW_DIR.mkdir(parents=True, exist_ok=True)
    FRAME_DIR.mkdir(parents=True, exist_ok=True)
    SAMPLE_DIR.mkdir(parents=True, exist_ok=True)
    videos = sorted(
        (path for path in VIDEO_DIR.iterdir() if path.is_file() and path.suffix.lower() in VIDEO_SUFFIXES),
        key=natural_key,
    )
    if not videos:
        raise SystemExit(f"No videos found in {VIDEO_DIR}")

    print(f"Probing {len(videos)} videos...")
    items = [probe_video(path) for path in videos]
    write_inventory(items)

    print("Running black-frame and audio scans...")
    with ThreadPoolExecutor(max_workers=3) as executor:
        futures = {}
        for item in items:
            futures[executor.submit(scan_black_frames, item)] = (item, "black")
            futures[executor.submit(scan_audio, item)] = (item, "audio")
        for future in as_completed(futures):
            item, scan_kind = futures[future]
            if scan_kind == "black":
                item["black_segments"] = future.result()
            else:
                item.update(future.result())
            print(f"  {item['filename']}: {scan_kind} scan complete")

    print("Extracting review frames...")
    with ThreadPoolExecutor(max_workers=3) as executor:
        future_to_item = {executor.submit(extract_review_frames, item): item for item in items}
        for future in as_completed(future_to_item):
            item = future_to_item[future]
            item.update(future.result())
            print(f"  {item['filename']}: frames complete")

    for item in items:
        item["technical_issues"] = summarize_issues(item)

    near_duplicates = duplicate_pairs(items)
    exact_duplicates = exact_duplicate_pairs(items)
    make_contact_sheet(items)

    output = {
        "methodology": {
            "black_frames": "FFmpeg blackdetect: >=0.50s, >=98% black pixels, pixel threshold 0.10",
            "long_silence": "FFmpeg silencedetect: below -50 dB for >=5s",
            "loudness": "FFmpeg loudnorm measurement; extreme outside -30 to -8 LUFS; hot/clipping risk at >=-0.1 dBTP",
            "low_bitrate": "Codec-adjusted bits-per-pixel-per-frame threshold (H.264/other <0.018; HEVC/AV1/VP9 <0.009)",
            "near_duplicates": "Perceptual dHash comparison across nine evenly spaced sample frames; candidates require >=34% short-cut coverage",
            "contact_frames": "Frames sampled at 5%, 50%, and 95% of runtime",
        },
        "exact_duplicates": exact_duplicates,
        "near_duplicate_candidates": near_duplicates,
        "videos": items,
    }
    with (REVIEW_DIR / "analysis.json").open("w", encoding="utf-8") as handle:
        json.dump(output, handle, indent=2, ensure_ascii=False)

    print("Done. Wrote inventory.csv, contact-sheet.jpg, and analysis.json.")


if __name__ == "__main__":
    main()
