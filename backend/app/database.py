from motor.motor_asyncio import AsyncIOMotorClient
from app.config import MONGO_URL, DB_NAME

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

async def create_indexes():
    # Users
    await db.users.create_index("email", unique=True)
    await db.users.create_index("username", unique=True)

    # BagLists
    await db.baglists.create_index("slug")
    await db.baglists.create_index("user_id")
    await db.baglists.create_index("category")
    await db.baglists.create_index("featured")
    await db.baglists.create_index([("user_id", 1), ("slug", 1)])

    # Clicks — TTL de 365 días
    await db.clicks.create_index("created_at", expireAfterSeconds=31536000)
    await db.clicks.create_index("product_id")
    await db.clicks.create_index("baglist_id")

    # Followers
    await db.followers.create_index("baglist_id")
    await db.followers.create_index("email")