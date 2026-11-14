import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


root = Path(__file__).resolve().parents[1]
analysis = json.loads((root / "review" / "analysis.json").read_text(encoding="utf-8"))
output_dir = Path(r"C:\Users\DONI BUTT\AppData\Local\Temp\opencode\portfolio-storyboards")
output_dir.mkdir(parents=True, exist_ok=True)

font_path = Path(r"C:\Windows\Fonts\segoeui.ttf")
bold_path = Path(r"C:\Windows\Fonts\seguisb.ttf")
font = ImageFont.truetype(str(font_path), 15)
bold = ImageFont.truetype(str(bold_path), 23)

videos = analysis["videos"]
for sheet_index in range(0, len(videos), 5):
    group = videos[sheet_index : sheet_index + 5]
    label_width = 155
    cell_width, cell_height = 170, 300
    gutter = 8
    header_height = 52
    row_height = 340
    width = label_width + 9 * (cell_width + gutter) + gutter
    height = header_height + len(group) * row_height
    canvas = Image.new("RGB", (width, height), "#0a0a0a")
    draw = ImageDraw.Draw(canvas)
    draw.text((16, 11), f"Nine-frame storyboards · videos {sheet_index + 1}–{sheet_index + len(group)}", font=bold, fill="white")

    for row_index, video in enumerate(group):
        top = header_height + row_index * row_height
        draw.rectangle((0, top, width, top + row_height - 4), fill="#111111" if row_index % 2 == 0 else "#171717")
        draw.text((16, top + 28), video["filename"], font=bold, fill="white")
        draw.multiline_text(
            (16, top + 70),
            f"{video['resolution']}\n{video['orientation']}\n{video['duration_seconds']:.1f}s",
            font=font,
            fill="#aaaaaa",
            spacing=6,
        )
        for column, sample in enumerate(video["sample_frames"]):
            left = label_width + gutter + column * (cell_width + gutter)
            frame_top = top + 25
            draw.rectangle((left, frame_top, left + cell_width, frame_top + cell_height), fill="black", outline="#333333")
            with Image.open(sample["path"]) as source:
                frame = ImageOps.contain(source.convert("RGB"), (cell_width - 4, cell_height - 28), Image.Resampling.LANCZOS)
            canvas.paste(frame, (left + (cell_width - frame.width) // 2, frame_top + 26 + (cell_height - 28 - frame.height) // 2))
            draw.text((left + 6, frame_top + 4), f"{sample['time']:.1f}s", font=font, fill="#dddddd")

    canvas.save(output_dir / f"storyboards-{sheet_index // 5 + 1}.jpg", quality=92, optimize=True)

print(output_dir)
