import csv
import uuid
from datetime import datetime
import asyncio
from app.database import db
import os

async def bulk_insert_baglists():
    """Inserta BagLists desde CSV a MongoDB"""
    try:
        csv_path = os.path.join(os.path.dirname(__file__), 'baglists_bulk.csv')
        
        if not os.path.exists(csv_path):
            print(f"❌ CSV no encontrado en {csv_path}")
            return {"error": "CSV not found"}
        
        users_cache = {}
        baglists_inserted = 0
        
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            for row in reader:
                email = row.get('Email', '').strip()
                nombre = row.get('Nombre', '').strip()
                categoria = row.get('Categoría', '').strip()
                lista_nombre = row.get('Nombre de la Lista', '').strip()
                
                if not email or not nombre or not lista_nombre:
                    print(f"⚠️  Fila incompleta, saltando...")
                    continue
                
                # Obtener user_id (cache para no buscar múltiples veces)
                if email not in users_cache:
                    user = await db.users.find_one({"email": email}, {"_id": 0, "id": 1})
                    if not user:
                        print(f"❌ Usuario {nombre} ({email}) no encontrado, saltando...")
                        continue
                    users_cache[email] = user["id"]
                
                user_id = users_cache[email]
                
                # Crear slug
                slug = lista_nombre.lower().replace(" ", "-").replace("á", "a").replace("é", "e").replace("í", "i").replace("ó", "o").replace("ú", "u").replace("ü", "u")
                
                # Crear productos
                products = []
                for i in range(1, 6):
                    producto_nombre = row.get(f'Producto {i}', '').strip()
                    if producto_nombre:
                        products.append({
                            "id": str(uuid.uuid4()),
                            "name": producto_nombre,
                            "description": "",
                            "link": "",
                            "image_url": "",
                            "custom_fields": {},
                            "discount_code": None
                        })
                
                # Insertar BagList
                baglist = {
                    "id": str(uuid.uuid4()),
                    "user_id": user_id,
                    "username": nombre,
                    "title": lista_nombre,
                    "slug": slug,
                    "description": "",
                    "category": categoria,
                    "cover_image_url": "",
                    "tags": [],
                    "is_public": False,
                    "products": products,
                    "created_at": datetime.utcnow().isoformat() + "+00:00",
                    "updated_at": datetime.utcnow().isoformat() + "+00:00",
                    "favorites_count": 0,
                    "saves_count": 0
                }
                
                await db.baglists.insert_one(baglist)
                baglists_inserted += 1
                print(f"✓ BagList '{lista_nombre}' creada para @{nombre}")
        
        print(f"\n✅ Completado: {baglists_inserted} BagLists insertadas")
        return {"inserted": baglists_inserted}
    
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return {"error": str(e)}

if __name__ == "__main__":
    result = asyncio.run(bulk_insert_baglists())
    print(result)