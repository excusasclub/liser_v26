import cloudinary
import cloudinary.api
from app.database import db
import logging

logger = logging.getLogger(__name__)

async def cleanup_unused_images():
    """Elimina imágenes de Cloudinary que no están en uso en la BD"""
    try:
        # Obtener todas las URLs de imagen en uso
        used_urls = set()
        
        # Imágenes de usuarios (avatars)
        users = await db.users.find({"avatar_url": {"$exists": True, "$ne": ""}}, {"_id": 0, "avatar_url": 1}).to_list(10000)
        for u in users:
            if u.get("avatar_url"):
                used_urls.add(u["avatar_url"])
        
        # Imágenes de baglists (covers + productos)
        baglists = await db.baglists.find({}, {"_id": 0, "cover_image_url": 1, "products": 1}).to_list(10000)
        for b in baglists:
            if b.get("cover_image_url"):
                used_urls.add(b["cover_image_url"])
            for p in b.get("products", []):
                if p.get("image_url"):
                    used_urls.add(p["image_url"])
        
        # Obtener todos los assets de Cloudinary
        cloudinary_assets = cloudinary.api.resources(type="upload", max_results=500)
        
        deleted_count = 0
        for asset in cloudinary_assets.get("resources", []):
            asset_url = asset.get("secure_url")
            public_id = asset.get("public_id", "")
            
            # No borrar imágenes de la carpeta /liser/landing/
            if public_id.startswith("liser/landing/"):
                continue
            
            if asset_url and asset_url not in used_urls:
                try:
                    cloudinary.api.delete_resources([public_id])
                    deleted_count += 1
                    logger.info(f"Deleted unused image: {public_id}")
                except Exception as e:
                    logger.error(f"Error deleting {public_id}: {str(e)}")
        
        logger.info(f"Cleanup complete: {deleted_count} images deleted")
        return {"deleted": deleted_count, "used": len(used_urls)}
    
    except Exception as e:
        logger.error(f"Cleanup error: {str(e)}")
        return {"error": str(e)}