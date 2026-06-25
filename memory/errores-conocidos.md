# errores-conocidos.md

## Infraestructura

**IP dinámica Movistar**  
La IP del servidor cambia periódicamente. Causa error 522 de Cloudflare. Fix: actualizar registro A en Cloudflare.

**Docker contenedores no parables tras reboot**  
Con Docker snap (ya migrado a apt) los contenedores no podían recibir SIGKILL por AppArmor. Con Docker apt resuelto. Si vuelve a pasar: `sudo kill -9 $(sudo docker inspect --format '{{.State.Pid}}' <container>)`

**mongod.lock tras kill forzado**  
Si MongoDB se mata forzosamente queda un lock file. Fix: `sudo docker run --rm -v liser_repo_mongo_data:/data/db mongo:7 rm /data/db/mongod.lock`

**Cloudflare SSL debe estar en Flexible**  
El servidor no tiene SSL propio activo. Si se cambia a Full o Strict, rompe. `api.liser.es` debe estar en naranja (proxied).

## Backend

**Login no verificaba contraseña** *(corregido)*  
El endpoint `/auth/login` generaba JWT sin llamar a `verify_password()`. Corregido.

**Usuarios OAuth con `password_hash` vacío**  
Usuarios creados con Google tienen `password_hash: ""`. El endpoint de login maneja esto con mensaje específico. El interceptor de axios no debe redirigir a `/auth` en 401 del login.

**`gravity: face` con `crop: pad` en Cloudinary**  
Combinación inválida. Avatares usan `crop: fill` con `gravity: face`. Covers y productos usan `crop: pad` sin gravity.

**Prerender solo para rutas `/{username}/{slug}` y `/explore`**  
Perfiles (`/user/{username}`) no tienen prerender. No es problema ahora con noindex global activo.

**`display_name` con `@` en datos antiguos**  
Algunos usuarios tienen `display_name` que empieza con `@`. El frontend lo limpia con `.replace(/^@/, '')`. Los datos en BD no se han limpiado.

## Frontend

**React 19 con `--legacy-peer-deps`**  
Algunas dependencias no son compatibles con React 19. Siempre usar `--legacy-peer-deps` en npm install.

**PowerShell `Out-File` crea archivos con null bytes**  
Causa `SyntaxError` en Python. Fix: `[System.IO.File]::WriteAllText(..., [System.Text.Encoding]::UTF8)`

**Interceptor axios redirige en 401**  
`api.js` redirige a `/auth` en cualquier 401 EXCEPTO `/auth/login`. Si se añaden nuevos endpoints que pueden devolver 401 sin ser errores de sesión, hay que añadirlos a la excepción.

**`sitemap.xml` estático en `public/`**  
Hay un `sitemap.xml` estático en `frontend/public/` que no se usa. El sitemap real lo genera el backend dinámicamente en `/sitemap.xml`. El estático puede causar confusión.

**`llm.txt` y `llms.txt` duplicados**  
Hay dos archivos: `frontend/public/llm.txt` y `frontend/public/llms.txt`. El correcto es `llms.txt`.

## Deploy

**`deploy.sh` solo en servidor, no en repo**  
El script de deploy no está versionado. Si se pierde el servidor, hay que recrearlo manualmente.

**`docker-compose.yml` con `version: '3.8'`**  
Genera un warning en cada deploy ("version is obsolete"). No causa problemas pero es ruido.

**Frontend cacheado tras deploy**  
Si un cambio de frontend no aparece, puede ser caché del navegador. Ctrl+Shift+R o vaciar caché.
