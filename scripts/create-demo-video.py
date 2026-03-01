#!/usr/bin/env python3
"""
Demo Video Generator for X Reply Drafter
Creates a professional 75-second demo video with transitions and text overlays
"""

import os
import subprocess
import tempfile
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import numpy as np

# Configuration
WIDTH = 1280
HEIGHT = 720
FPS = 30
DURATION = 75  # seconds
OUTPUT_VIDEO = Path(__file__).parent.parent / "public" / "demo-video.mp4"

# Colors
BG_DARK = (26, 26, 26)  # #1a1a1a
BG_DARKER = (15, 15, 15)  # #0f0f0f
BLUE = (59, 130, 246)  # #3b82f6
CYAN = (34, 211, 238)  # #22d3ee
WHITE = (255, 255, 255)
GRAY = (107, 114, 128)  # #6b7280
GREEN = (16, 185, 129)  # #10b981
RED = (239, 68, 68)  # #ef4444
YELLOW = (251, 191, 36)  # #fbbf24

def get_font(size=48):
    """Get a suitable font, fallback to default if not available"""
    try:
        return ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", size)
    except:
        return ImageFont.load_default()

def create_frame(frame_num, total_frames):
    """Create a single frame of the demo video"""
    img = Image.new('RGB', (WIDTH, HEIGHT), BG_DARK)
    draw = ImageDraw.Draw(img)
    
    # Calculate timing
    t = (frame_num / FPS) % DURATION
    
    # Segment 1 (0-5s): Hook
    if t < 5:
        alpha = min(1.0, t / 0.5)
        font_large = get_font(72)
        text = "Tired of staring at a\nblank X reply box?"
        
        # Create semi-transparent background
        draw.rectangle([(0, 0), (WIDTH, HEIGHT)], fill=BG_DARK)
        
        # Draw text
        bbox = draw.textbbox((0, 0), text, font=font_large)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        x = (WIDTH - text_width) // 2
        y = (HEIGHT - text_height) // 2 - 100
        draw.text((x, y), text, fill=WHITE, font=font_large)
    
    # Segment 2 (5-15s): Problem
    elif t < 15:
        draw.rectangle([(0, 0), (WIDTH, HEIGHT)], fill=BG_DARK)
        
        font_medium = get_font(60)
        if t < 10:
            text = "You see an interesting post"
            color = CYAN
        else:
            text = "But you're stuck on how\nto reply"
            color = CYAN
        
        bbox = draw.textbbox((0, 0), text, font=font_medium)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        x = (WIDTH - text_width) // 2
        y = (HEIGHT - text_height) // 2
        draw.text((x, y), text, fill=color, font=font_medium)
    
    # Segment 3 (15-25s): Solution
    elif t < 25:
        draw.rectangle([(0, 0), (WIDTH, HEIGHT)], fill=BG_DARKER)
        
        font_xlarge = get_font(80)
        font_medium = get_font(48)
        
        # Title
        title = "X Reply Drafter"
        bbox = draw.textbbox((0, 0), title, font=font_xlarge)
        title_width = bbox[2] - bbox[0]
        x = (WIDTH - title_width) // 2
        draw.text((x, 150), title, fill=BLUE, font=font_xlarge)
        
        # Subtitle
        if t > 20:
            subtitle = "Click Draft Reply"
            bbox = draw.textbbox((0, 0), subtitle, font=font_medium)
            subtitle_width = bbox[2] - bbox[0]
            x = (WIDTH - subtitle_width) // 2
            draw.text((x, 400), subtitle, fill=WHITE, font=font_medium)
    
    # Segment 4 (25-37s): Magic - Generating
    elif t < 37:
        draw.rectangle([(0, 0), (WIDTH, HEIGHT)], fill=BG_DARK)
        
        font_large = get_font(64)
        font_medium = get_font(48)
        font_small = get_font(32)
        
        # Generating text
        if t < 28:
            gen_text = "✨ AI Generating..."
            bbox = draw.textbbox((0, 0), gen_text, font=font_large)
            x = (WIDTH - bbox[2] + bbox[0]) // 2
            draw.text((x, 150), gen_text, fill=BLUE, font=font_large)
        
        # Option 1
        if t >= 28 and t < 31:
            draw.text((160, 220), "✓ Option 1", fill=GREEN, font=font_medium)
            draw.text((160, 280), "Your perspective is refreshing...", fill=WHITE, font=font_small)
        
        # Option 2
        if t >= 31 and t < 34:
            draw.text((160, 320), "✓ Option 2", fill=GREEN, font=font_medium)
            draw.text((160, 380), "Brilliant execution on this...", fill=WHITE, font=font_small)
        
        # Option 3
        if t >= 34:
            draw.text((160, 420), "✓ Option 3", fill=GREEN, font=font_medium)
            draw.text((160, 480), "This is incredible...", fill=WHITE, font=font_small)
    
    # Segment 5 (37-50s): Benefit
    elif t < 50:
        draw.rectangle([(0, 0), (WIDTH, HEIGHT)], fill=BG_DARKER)
        
        font_large = get_font(60)
        font_medium = get_font(36)
        
        if t < 40:
            text = "You pick the best reply"
            bbox = draw.textbbox((0, 0), text, font=font_large)
            x = (WIDTH - bbox[2] + bbox[0]) // 2
            draw.text((x, 200), text, fill=BLUE, font=font_large)
        elif t < 45:
            text = "Post it"
            bbox = draw.textbbox((0, 0), text, font=font_large)
            x = (WIDTH - bbox[2] + bbox[0]) // 2
            draw.text((x, 300), text, fill=BLUE, font=font_large)
        else:
            text = "Watch the engagement"
            bbox = draw.textbbox((0, 0), text, font=font_large)
            x = (WIDTH - bbox[2] + bbox[0]) // 2
            draw.text((x, 200), text, fill=RED, font=font_large)
            
            metrics = "1.2K replies • 3.4K retweets • 12K likes"
            bbox = draw.textbbox((0, 0), metrics, font=font_medium)
            x = (WIDTH - bbox[2] + bbox[0]) // 2
            draw.text((x, 400), metrics, fill=YELLOW, font=font_medium)
    
    # Segment 6 (50-75s): CTA
    else:
        draw.rectangle([(0, 0), (WIDTH, HEIGHT)], fill=BG_DARK)
        
        # Gradient background effect
        for i in range(HEIGHT):
            ratio = i / HEIGHT
            r = int(26 * (1 - ratio * 0.2))
            g = int(26 * (1 - ratio * 0.2))
            b = int(26)
            draw.line([(0, i), (WIDTH, i)], fill=(r, g, b))
        
        font_xlarge = get_font(72)
        font_large = get_font(48)
        font_medium = get_font(36)
        
        main_text = "Add X Reply Drafter"
        bbox = draw.textbbox((0, 0), main_text, font=font_xlarge)
        x = (WIDTH - bbox[2] + bbox[0]) // 2
        draw.text((x, 120), main_text, fill=BLUE, font=font_xlarge)
        
        subtitle = "Free Chrome Extension"
        bbox = draw.textbbox((0, 0), subtitle, font=font_large)
        x = (WIDTH - bbox[2] + bbox[0]) // 2
        draw.text((x, 280), subtitle, fill=WHITE, font=font_large)
        
        details = "No API Key • No Monthly Fees"
        bbox = draw.textbbox((0, 0), details, font=font_large)
        x = (WIDTH - bbox[2] + bbox[0]) // 2
        draw.text((x, 400), details, fill=WHITE, font=font_large)
        
        if t > 60:
            url = "Visit x-reply-drafter.com"
            bbox = draw.textbbox((0, 0), url, font=font_medium)
            x = (WIDTH - bbox[2] + bbox[0]) // 2
            draw.text((x, 550), url, fill=(96, 165, 250), font=font_medium)
    
    return img

def generate_video():
    """Generate the demo video"""
    print("🎬 Creating demo video frames...")
    
    # Create temp directory for frames
    with tempfile.TemporaryDirectory() as tmpdir:
        tmpdir = Path(tmpdir)
        
        # Generate all frames
        total_frames = int(DURATION * FPS)
        for i in range(total_frames):
            if i % 30 == 0:  # Progress update every second
                print(f"  Frame {i}/{total_frames} ({i/FPS:.1f}s)...")
            
            frame = create_frame(i, total_frames)
            frame_path = tmpdir / f"frame_{i:05d}.png"
            frame.save(frame_path)
        
        print("✅ Frames created")
        
        # Ensure output directory exists
        OUTPUT_VIDEO.parent.mkdir(parents=True, exist_ok=True)
        
        # Use FFmpeg to create video from frames
        print("🎥 Encoding video with FFmpeg...")
        cmd = [
            'ffmpeg',
            '-framerate', str(FPS),
            '-i', str(tmpdir / 'frame_%05d.png'),
            '-c:v', 'libx264',
            '-pix_fmt', 'yuv420p',
            '-preset', 'medium',
            '-crf', '23',
            '-y',
            str(OUTPUT_VIDEO)
        ]
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode != 0:
                print(f"FFmpeg error: {result.stderr}")
                return False
        except Exception as e:
            print(f"Error running FFmpeg: {e}")
            return False
        
        print("✅ Video encoded successfully")
        return True

if __name__ == '__main__':
    try:
        success = generate_video()
        if success:
            print(f"\n✅ Demo video created: {OUTPUT_VIDEO}")
            print(f"📊 Duration: {DURATION}s | Resolution: {WIDTH}x{HEIGHT} | FPS: {FPS}")
        else:
            print("\n❌ Failed to create video")
            exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
