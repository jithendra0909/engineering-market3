import sys
from PIL import Image, ImageChops

def trim(im):
    # Trim solid background color based on top-left pixel
    bg_color = im.getpixel((0, 0))
    bg = Image.new(im.mode, im.size, bg_color)
    diff = ImageChops.difference(im, bg)
    diff = ImageChops.add(diff, diff, 2.0, -100)
    bbox = diff.getbbox()
    if bbox:
        return im.crop(bbox)
    return im

file_path = r"c:\Users\Jithendra\.gemini\antigravity-ide\scratch\engineering market 2\client\public\images\em_print_orders_banner.png"
try:
    im = Image.open(file_path)
    trimmed = trim(im)
    trimmed.save(file_path)
    print("SUCCESS")
except Exception as e:
    print(f"ERROR: {e}")
