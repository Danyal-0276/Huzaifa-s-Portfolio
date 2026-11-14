import importlib.util
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


root = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("video_analysis", root / "review" / "analyze_videos.py")
analysis_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(analysis_module)

data = json.loads((root / "review" / "analysis.json").read_text(encoding="utf-8"))
temp = Path(r"C:\Users\DONI BUTT\AppData\Local\Temp\opencode\portfolio-openings")
temp.mkdir(parents=True, exist_ok=True)
times = (0.15, 0.5, 1.0, 2.0, 3.0)

for video in data["videos"]:
    stem = Path(video["filename"]).stem
    video["opening_frames"] = []
    for index, time_seconds in enumerate(times):
        time_seconds = min(time_seconds, max(video["duration_seconds"] - 0.05, 0.05))
        output = temp / f"{stem}-{index}.jpg"
        analysis_module.extract_frame(video["path"], time_seconds, output, max_side=720)
        video["opening_frames"].append((time_seconds, output))

regular = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 14)
bold = ImageFont.truetype(r"C:\Windows\Fonts\seguisb.ttf", 21)
label_width, cell_width, cell_height, gutter = 145, 180, 300, 8
header_height, row_height = 48, 338

for group_start in range(0, len(data["videos"]), 6):
    group = data["videos"][group_start : group_start + 6]
    width = label_width + len(times) * (cell_width + gutter) + gutter
    height = header_height + len(group) * row_height
    canvas = Image.new("RGB", (width, height), "#090909")
    draw = ImageDraw.Draw(canvas)
    draw.text((14, 9), "Opening frames · 0.15s / 0.5s / 1s / 2s / 3s", fill="white", font=bold)
    for row, video in enumerate(group):
        top = header_height + row * row_height
        draw.rectangle((0, top, width, top + row_height - 4), fill="#111111" if row % 2 == 0 else "#171717")
        draw.text((14, top + 24), video["filename"], fill="white", font=bold)
        draw.multiline_text((14, top + 61), f"{video['resolution']}\n{video['duration_seconds']:.1f}s", fill="#aaaaaa", font=regular, spacing=5)
        for column, (time_seconds, path) in enumerate(video["opening_frames"]):
            left = label_width + gutter + column * (cell_width + gutter)
            frame_top = top + 20
            draw.rectangle((left, frame_top, left + cell_width, frame_top + cell_height), fill="black", outline="#333333")
            with Image.open(path) as source:
                frame = ImageOps.contain(source.convert("RGB"), (cell_width - 4, cell_height - 27), Image.Resampling.LANCZOS)
            canvas.paste(frame, (left + (cell_width - frame.width) // 2, frame_top + 25 + (cell_height - 27 - frame.height) // 2))
            draw.text((left + 6, frame_top + 4), f"{time_seconds:.2f}s", fill="#dddddd", font=regular)
    canvas.save(temp / f"openings-{group_start // 6 + 1}.jpg", quality=92, optimize=True)

print(temp)
