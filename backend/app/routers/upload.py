from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
from app.dependencies import get_required_user
import cloudinary
import cloudinary.uploader
from pathlib import Path
from dotenv import load_dotenv
import os

load_dotenv(Path(__file__).parent.parent.parent / '.env', override=True)
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)

router = APIRouter(prefix="/upload")

@router.post("/image")
@limiter.limit("10/minute")
async def upload_image_file(request: Request, file: UploadFile = File(...), type: str = "product", user=Depends(get_required_user)):
    if not file:
        raise HTTPException(status_code=400, detail="No file provided")
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Formato no permitido. Usa JPG, PNG, WEBP o GIF")
    if file.size and file.size > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="La imagen no puede superar 5MB")
    contents = await file.read()
    magic_bytes = {
        b'\xff\xd8\xff': 'image/jpeg',
        b'\x89PNG': 'image/png',
        b'RIFF': 'image/webp',
        b'GIF8': 'image/gif',
    }
    if not any(contents.startswith(sig) for sig in magic_bytes):
        raise HTTPException(status_code=400, detail="Archivo no válido")
    try:
        transformations = {
            "avatar": [{"width": 400, "height": 400, "crop": "pad", "gravity": "face"}, {"quality": "auto"}],
            "cover": [{"width": 1200, "height": 630, "crop": "pad"}, {"quality": "auto"}],
            "product": [{"width": 800, "height": 800, "crop": "pad", "background": "auto"}, {"quality": "auto"}],
        }
        result = cloudinary.uploader.upload(
            contents,
            folder=f"liser/{type}",
            transformation=transformations.get(type, transformations["product"])
        )
        return {"url": result["secure_url"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al subir imagen: {str(e)}")