# flujo-de-trabajo.md

## Entorno local

- **OS:** Windows, PowerShell (usar `;` en vez de `&&`)
- **Ruta local:** `D:\Excusas Automaticas\Liser_v26`
- **Node:** 18 via nvm-windows
- **Python:** venv en `backend/venv`
- **npm:** siempre `--legacy-peer-deps`
- **Servidor:** Ubuntu 24.10, SSH como `lch@192.168.1.35`
- **Repo:** `github.com/excusasclub/liser_v26` (privado)

## Hacer un cambio

1. Editar en local (`D:\Excusas Automaticas\Liser_v26`)
2. Push:
   ```powershell
   cd "D:\Excusas Automaticas\Liser_v26" ; git add . ; git commit -m "tipo: descripción" ; git push
   ```
3. Deploy en servidor:
   ```bash
   ~/deploy.sh
   ```
   El script hace: git pull → inyecta REACT_APP_BACKEND_URL → docker compose up --no-deps --build -d

## Variables de entorno

- El frontend recibe `REACT_APP_BACKEND_URL=https://api.liser.es` inyectado por `deploy.sh` en `frontend/.env`
- El backend lee `backend/.env` directamente en el servidor (nunca en el repo)
- Cloudinary config debe ir DESPUÉS de `load_dotenv()` en `main.py`

## Comandos útiles en servidor

```bash
# Logs backend
sudo docker logs liser_backend --tail=50

# Hacer admin
sudo docker exec -it liser_backend python make_admin.py <username>

# Backup manual MongoDB
~/backup_mongo.sh

# Reiniciar nginx
sudo docker restart liser_nginx

# Ver contenedores
docker ps
```

## Checklist "terminado"

- [ ] Cambio funciona en local (o se ha probado directamente en prod)
- [ ] Push a master
- [ ] Deploy ejecutado sin errores
- [ ] Verificado en liser.es

## Deploy sin downtime

`deploy.sh` usa `--no-deps --build` — solo rebuilda backend y frontend. MongoDB y nginx siguen corriendo. Hay ~2-3 segundos de caída en backend/frontend durante el swap.

## Backup automático

Cron diario a las 3:00 AM UTC: `~/backup_mongo.sh`  
Retención: 7 días en `~/backups/`

## Dar admin a un usuario

```bash
sudo docker exec -it liser_backend python make_admin.py <username>
```

## Problema recurrente: IP dinámica

Movistar cambia la IP periódicamente. Si la web da 522:
1. `curl ifconfig.me` en el servidor
2. Actualizar registro A en Cloudflare con la nueva IP
3. `api.liser.es` debe estar en naranja (proxied)
4. SSL en Cloudflare debe estar en Flexible
