#!/bin/bash
#
# Convert hydra video frames to ASCII art frames.
# Uses ffmpeg for image processing, outputs a JSON array of ASCII strings.
#
# Usage: bash scripts/frames-to-ascii.sh

INPUT="/tmp/hydra-recording.mov"
OUTPUT="public/hydra-anim.json"
COLS=200
ROWS=80
FRAME_STEP=4  # sample every Nth frame → ~55 frames from 220
FPS=15

echo "Extracting and converting frames..."

# Use Python to do the heavy lifting — it has PIL/Pillow or we can use raw ffmpeg output
python3 << 'PYEOF'
import subprocess, json, sys, os

INPUT = "/tmp/hydra-recording.mov"
OUTPUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "hydra-anim.json")
COLS = 200
ROWS = 80
FRAME_STEP = 4
FPS = 15

CHARS = " .·:;+*?%S#@$"

# Extract raw grayscale frames via ffmpeg
# Output format: raw gray8 pixels, one frame = COLS * ROWS bytes
cmd = [
    "ffmpeg", "-y", "-i", INPUT,
    "-vf", f"fps={FPS},scale={COLS}:{ROWS}:flags=lanczos,format=gray",
    "-f", "rawvideo", "-pix_fmt", "gray",
    "-"
]

print(f"Running ffmpeg to extract {COLS}x{ROWS} grayscale frames...")
proc = subprocess.run(cmd, capture_output=True)

if proc.returncode != 0:
    print("ffmpeg error:", proc.stderr.decode()[-500:])
    sys.exit(1)

raw = proc.stdout
frame_size = COLS * ROWS
total_frames = len(raw) // frame_size
sampled = total_frames // FRAME_STEP

print(f"Got {total_frames} frames, sampling every {FRAME_STEP}th = {sampled} frames")

frames = []
for i in range(0, total_frames, FRAME_STEP):
    offset = i * frame_size
    frame_data = raw[offset:offset + frame_size]
    if len(frame_data) < frame_size:
        break

    ascii_frame = ""
    for row in range(ROWS):
        for col in range(COLS):
            brightness = frame_data[row * COLS + col]
            ci = int((brightness / 255) * (len(CHARS) - 1))
            ascii_frame += CHARS[ci]
        ascii_frame += "\n"

    frames.append(ascii_frame)

    if len(frames) % 10 == 0:
        print(f"  Converted {len(frames)} frames...")

# Write JSON
output_json = json.dumps(frames)
with open(OUTPUT, "w") as f:
    f.write(output_json)

size_mb = len(output_json) / 1024 / 1024
print(f"\nDone! {len(frames)} frames -> {OUTPUT} ({size_mb:.1f} MB)")
PYEOF
