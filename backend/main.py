from fastapi import FastAPI, HTTPException
from starlette.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from pathlib import Path
from dotenv import load_dotenv
import os
import cloudinary
import logging

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env',override=True)

cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)

from app.routers import auth, baglists, users, upload, admin, plans, contact
from app.config import CATEGORIES

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

limiter = Limiter(key_func=get_remote_address)
app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get('CORS_ORIGINS', 'http://localhost:3000').split(','),
    allow_origin_regex=r'https?://(.*\.)?liser\.es',
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(baglists.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(upload.router, prefix="/api")
app.include_router(plans.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(contact.router, prefix="/api")
from app.database import create_indexes

@app.on_event("startup")
async def startup_event():
    await create_indexes()
    # Programar cron de limpieza Cloudinary cada domingo a las 2 AM
    from apscheduler.schedulers.asyncio import AsyncIOScheduler
    from app.services.cloudinary_cleanup_service import cleanup_unused_images
    scheduler = AsyncIOScheduler()
    scheduler.add_job(cleanup_unused_images, 'cron', day_of_week=6, hour=2, minute=0)
    scheduler.start()
@app.get("/api/categories")
async def get_categories():
    return CATEGORIES

@app.get("/api/sitemap")
async def get_sitemap():
    from app.database import db
    from fastapi.responses import Response
    baglists = await db.baglists.find(
        {"is_public": True, "slug": {"$exists": True}},
        {"_id": 0, "slug": 1, "username": 1, "updated_at": 1}
    ).to_list(5000)
    users = []
    urls = [
        "<url><loc>https://liser.es/explore</loc><changefreq>daily</changefreq><priority>0.9</priority></url>",
    ]
    for b in baglists:
        if b.get("slug") and b.get("username"):
            lastmod = b.get("updated_at", "")[:10]
            urls.append(f"<url><loc>https://liser.es/{b['username']}/{b['slug']}</loc><lastmod>{lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>")
    xml = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + "".join(urls) + "</urlset>"
    return Response(content=xml, media_type="application/xml")

@app.get("/sitemap.xml")
async def get_sitemap_xml():
    return await get_sitemap()

@app.get("/render/explore")
async def prerender_explore():
    from app.database import db
    from fastapi.responses import HTMLResponse
    import json
    from app.config import CATEGORIES
    def esc(s): return (s or "").replace("&","&amp;").replace("<","&lt;").replace(">","&gt;").replace('"',"&quot;")
    baglists = await db.baglists.find(
        {"is_public": True, "featured": True},
        {"_id": 0, "title": 1, "slug": 1, "username": 1, "description": 1}
    ).to_list(6)
    items_html = "".join(
        "<h2>" + esc(b.get("title", "")) + "</h2><p>" + esc(b.get("description")) + "</p>"
        for b in baglists
    )
    cats_html = "".join("<li>" + esc(c) + "</li>" for c in CATEGORIES)
    json_ld = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Explorar BagLists — Liser",
        "description": "Descubre listas de productos recomendados por creadores reales, organizadas por categorías.",
        "url": "https://liser.es/explore"
    }
    json_ld_str = json.dumps(json_ld, ensure_ascii=False)
    html = (
        "<!DOCTYPE html><html lang='es'><head>"
        "<meta charset='UTF-8'>"
        "<title>Explorar BagLists — Liser</title>"
        "<meta name='description' content='Descubre listas de productos recomendados por creadores reales, organizadas por categorías.'>"
        "<link rel='canonical' href='https://liser.es/explore'>"
        "<script type='application/ld+json'>" + json_ld_str + "</script>"
        "</head><body>"
        "<h1>Explorar BagLists</h1>"
        "<ul>" + cats_html + "</ul>"
        + items_html +
        "</body></html>"
    )
    return HTMLResponse(content=html)

@app.get("/render/{username}/{slug}")
async def prerender_baglist(username: str, slug: str):
    from app.database import db
    from fastapi.responses import HTMLResponse
    import json
    baglist = await db.baglists.find_one({"slug": slug, "is_public": True}, {"_id": 0})
    if not baglist:
        raise HTTPException(status_code=404, detail="Not found")
    user = await db.users.find_one({"username": username}, {"_id": 0, "display_name": 1})
    display_name = user.get("display_name", username) if user else username
    title = baglist['title'] + " — Liser"
    description = baglist.get("description") or "Lista de productos de " + display_name + " en Liser"
    image = baglist.get("cover_image_url", "")
    url = "https://liser.es/" + username + "/" + slug
    products = baglist.get('products', [])

    def esc(s): return (s or "").replace("&","&amp;").replace("<","&lt;").replace(">","&gt;").replace('"',"&quot;")
    product_html = "".join(
        "<h2>" + esc(p.get('name')) + "</h2><p>" + esc(p.get('description')) + "</p>"
        for p in products
    )
    og_image = "<meta property='og:image' content='" + esc(image) + "'>" if image else ""
    tw_image = "<meta name='twitter:image' content='" + esc(image) + "'>" if image else ""

    json_ld = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": baglist['title'],
        "description": description,
        "url": url,
        "author": {
            "@type": "Person",
            "name": display_name,
            "url": "https://liser.es/user/" + username
        },
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": i + 1,
                "name": p.get('name', ''),
                "url": p.get('link', url),
                "description": p.get('description', ''),
                **({"image": p['image_url']} if p.get('image_url') else {})
            }
            for i, p in enumerate(products)
        ]
    }
    json_ld_str = json.dumps(json_ld, ensure_ascii=False)

    html = (
        "<!DOCTYPE html><html lang='es'><head>"
        "<meta charset='UTF-8'>"
        "<title>" + esc(title) + "</title>"
        "<meta name='description' content='" + esc(description) + "'>"
        "<link rel='canonical' href='" + esc(url) + "'>"
        "<meta property='og:title' content='" + esc(title) + "'>"
        "<meta property='og:description' content='" + esc(description) + "'>"
        "<meta property='og:type' content='website'>"
        "<meta property='og:url' content='" + esc(url) + "'>"
        + og_image +
        "<meta name='twitter:card' content='summary_large_image'>"
        "<meta name='twitter:title' content='" + title + "'>"
        "<meta name='twitter:description' content='" + description + "'>"
        + tw_image +
        "<script type='application/ld+json'>" + json_ld_str + "</script>"
        "</head><body>"
        "<h1>" + baglist['title'] + "</h1>"
        "<p>" + description + "</p>"
        + product_html +
        "</body></html>"
    )
    return HTMLResponse(content=html)

@app.get("/api/")
async def root():
    return {"message": "Liser API"}