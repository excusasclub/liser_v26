import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "liser_db")

async def migrate():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]

    baglists = await db.baglists.find({}).to_list(length=None)
    updated = 0

    for baglist in baglists:
        products = baglist.get("products", [])
        changed = False
        for i, product in enumerate(products):
            if "discount_code" not in product:
                products[i]["discount_code"] = ""
                changed = True
            if "custom_fields" not in product:
                products[i]["custom_fields"] = []
                changed = True
            if "description" not in product:
                products[i]["description"] = ""
                changed = True
            if "created_at" not in product:
                products[i]["created_at"] = baglist.get("created_at", datetime.now(timezone.utc).isoformat())
                changed = True
            if "updated_at" not in product:
                products[i]["updated_at"] = baglist.get("updated_at", datetime.now(timezone.utc).isoformat())
                changed = True
            if "price" not in product:
                products[i]["price"] = None
                changed = True
        if changed:
            await db.baglists.update_one(
                {"_id": baglist["_id"]},
                {"$set": {"products": products}}
            )
            updated += 1

    print(f"Migración completada. Listas actualizadas: {updated}")
    client.close()

if __name__ == "__main__":
    asyncio.run(migrate())