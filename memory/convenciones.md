# convenciones.md

## Naming

- **Término oficial:** "BagList" (nunca "lista", nunca "bag list" separado)
- **Slugs:** generados al crear, nunca se regeneran al editar (SEO)
- **Usernames:** permanentes desde el registro, inmutables
- **IDs:** UUID v4 como string (`str(uuid.uuid4())`), no ObjectId de Mongo
- **Fechas:** ISO 8601 en UTC (`.isoformat()`)
- **Rutas frontend:** `/username/slug` para BagLists, `/user/username` para perfiles
- **Rutas backend:** prefijo `/api` en todos los routers excepto `/render/*` y `/sitemap.xml`

## Frontend

- Framework de componentes: shadcn/ui (Radix UI)
- Estilos: Tailwind CSS, sin CSS modules
- Fuentes: `font-['Outfit']` para títulos, `font-['Inter']` para cuerpo
- Tema: dark/light toggle persistido en localStorage, variable `data-theme`
- Iconos: lucide-react para UI, `@icons-pack/react-simple-icons` para RRSS
- Toast: sonner (no react-hot-toast ni otros)
- Estado global: solo AuthContext — sin Redux, sin Zustand
- Axios: instancia centralizada en `src/lib/api.js` con interceptor 401
- Imports: alias `@/` → `src/`
- npm: siempre `--legacy-peer-deps`

## Backend

- Framework: FastAPI con Pydantic v2
- DB: Motor (async MongoDB driver)
- Auth: JWT en header `Authorization: Bearer <token>`
- Passwords: bcrypt via passlib
- Rate limiting: slowapi
- Imágenes: SOLO Cloudinary, nunca URLs externas
- Cloudinary config: siempre después de `load_dotenv()` en main.py
- Variables de entorno: `.env` en `backend/`, nunca en el repo

## Patrones prohibidos

- `gravity: auto` con `crop: pad` en Cloudinary
- Slugs regenerándose al editar título
- Endpoints públicos devolviendo email u otros datos sensibles de usuarios
- `localStorage` para datos sensibles (salvo token JWT — pendiente migración)
- Imágenes desde URLs externas (solo Cloudinary)

## Commits

- Sin convención formal detectada en el repo
- Patrón usado en práctica: `feat:`, `fix:`, `refactor:` como prefijos
- [PENDIENTE: adoptar Conventional Commits formalmente]

## Tests

- No hay tests funcionales reales
- `backend_test.py` existe pero está prácticamente vacío
- [PENDIENTE: cobertura mínima en auth y baglists]
