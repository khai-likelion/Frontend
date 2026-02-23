from PIL import Image
import os

def crop_transparency(img_path):
    if not os.path.exists(img_path):
        print(f"Error: {img_path} not found")
        return

    img = Image.open(img_path)
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # Get the bounding box of non-zero (non-transparent) regions
    bbox = img.getbbox()
    if bbox:
        cropped_img = img.crop(bbox)
        cropped_img.save(img_path)
        print(f"Successfully cropped {img_path}. New size: {cropped_img.size}")
    else:
        print("Image is fully transparent, no cropping performed.")

if __name__ == "__main__":
    logo_path = r"c:\Users\changhyun\Desktop\New_KHAI\lovelop-frontend\src\assets\images\logo.png"
    crop_transparency(logo_path)
