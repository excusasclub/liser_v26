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
            if "social_links" not in product:
                products[i]["social_links"] = []
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

    # Migración de usuarios: añadir campos de plan y rol
    users = await db.users.find({}).to_list(length=None)
    users_updated = 0
    for user in users:
        fields = {}
        if "role" not in user:
            fields["role"] = "user"
        if "plan" not in user:
            fields["plan"] = "free"
        if "suspended" not in user:
            fields["suspended"] = False
        if "last_login" not in user:
            fields["last_login"] = None
        if fields:
            await db.users.update_one({"_id": user["_id"]}, {"$set": fields})
            users_updated += 1

    print(f"Usuarios migrados: {users_updated}")
    client.close()

if __name__ == "__main__":
    asyncio.run(migrate())