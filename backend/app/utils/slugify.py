import re
import unicodedata

def slugify(text: str) -> str:
    text = unicodedata.normalize('NFKD', text)
    text = text.encode('ascii', 'ignore').decode('ascii')
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'[\s-]+', '-', text)
    text = text.strip('-')
    return text or "baglist"

async def generate_unique_slug(db, base_slug: str, exclude_id: str = None) -> str:
    slug = base_slug
    counter = 1
    while True:
        query = {"slug": slug}
        if exclude_id:
            query["id"] = {"$ne": exclude_id}
        existing = await db.baglists.find_one(query)
        if not existing:
            return slug
        slug = f"{base_slug}-{counter}"
        counter += 1