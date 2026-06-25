# arquitectura.md

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 19 (CRA + CRACO), Tailwind CSS, shadcn/ui, React Router v7 |
| Backend | FastAPI + Uvicorn, Python 3.11 |
| Base de datos | MongoDB 7 (motor async) |
| Imágenes | Cloudinary (único pipeline, sin URLs externas) |
| Email | Resend (dominio liser.es, región Ireland) |
| Proxy | Nginx Alpine (contenedor Docker) |
| SSL | Cloudflare Flexible (termina en Cloudflare, HTTP internamente) |
| Contenedores | Docker Compose (5 servicios: nginx, frontend, backend, mongo, certbot) |

## Mapa de carpetas

```
liser_v26/
├── backend/
│   ├── main.py              # Entry point, sitemap, prerender crawlers, startup indexes
│   ├── app/
│   │   ├── config.py        # CATEGORIES, MONGO_URL, DB_NAME
│   │   ├── database.py      # Motor client, create_indexes()
│   │   ├── dependencies.py  # get_required_user, get_optional_user, get_required_admin
│   │   ├── models/          # Pydantic models: user, baglist, product
│   │   ├── routers/         # auth, baglists, users, upload, admin, plans, contact
│   │   ├── services/        # auth_service (jwt/bcrypt), resend_service (email)
│   │   └── utils/           # slugify
│   ├── make_admin.py        # Script CLI para dar rol admin
│   └── migrate.py           # Script de migraciones manuales
├── frontend/
│   ├── public/              # index.html (noindex global), robots.txt, llms.txt, sitemap.xml estático
│   ├── src/
│   │   ├── App.js           # Rutas, ProtectedRoute, AdminRoute, PlanRoute
│   │   ├── context/AuthContext.js  # Auth global, theme toggle
│   │   ├── lib/api.js       # Axios + interceptor 401
│   │   ├── components/      # Navbar, BagListCard, ImageUpload, FollowerCaptureModal, Footer
│   │   ├── components/ui/   # shadcn/ui (Radix)
│   │   └── pages/           # Una página por ruta
├── nginx/
│   └── nginx.conf           # Proxy, prerender para crawlers, sitemap.xml
└── docker-compose.yml
```

## Flujo de datos principal

```
Usuario → Cloudflare (SSL Flexible) → Nginx:80
  → /api/* → backend:8001 (FastAPI)
  → /* → frontend:80 (Nginx estático React)
  → Googlebot/* → backend:8001/render/{username}/{slug}
```

## Colecciones MongoDB

- `users` — cuenta, rol, plan, tokens
- `baglists` — listas con productos embebidos (array)
- `clicks` — clics en productos (TTL 365 días)
- `followers` — emails capturados por BagList
- `favorites` — me gustas
- `saves` — guardados
- `email_logs` — log de emails enviados

## Qué NO existe

- Tests automatizados reales (backend_test.py casi vacío)
- Staging environment funcional
- SSR / Next.js (React CSR puro)
- Base de datos de productos separada (productos embebidos en BagList)
- Internacionalización (i18n)
- MongoDB con autenticación
- 2FA
- Monitoring / alertas
- CI/CD (deploy manual vía deploy.sh)
