import asyncio
import sys
import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).parent / '.env')

from motor.motor_asyncio import AsyncIOMotorClient

async def run():
    if len(sys.argv) < 2:
        print("Uso: python make_admin.py <username>")
        return
    username = sys.argv[1]
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = client[os.environ['DB_NAME']]
    result = await db.users.update_one(
        {"username": username},
        {"$set": {"role": "admin"}}
    )
    if result.modified_count:
        print(f"✓ {username} ahora es admin")
    else:
        print(f"✗ Usuario '{username}' no encontrado")

asyncio.run(run())