# decisiones.md

## Productos embebidos en BagList (no colección separada)

**Decisión:** productos como array dentro del documento BagList en MongoDB.  
**Por qué:** simplicidad inicial, una sola query para cargar toda la lista.  
**Descartado:** colección separada (más queries, más complejidad).  
**Riesgo conocido:** con muchos productos por lista y muchas listas, las queries se vuelven lentas. A revisar cuando haya tráfico real.

## React CSR + Prerender manual para crawlers

**Decisión:** React SPA pura + endpoint `/render/{username}/{slug}` en FastAPI que devuelve HTML estático a Googlebot.  
**Por qué:** evitar migración a Next.js/SSR que requeriría reescribir el stack.  
**Descartado:** prerender.io (servicio de pago), SSR (migración grande).  
**Estado:** funcionando para BagLists y `/explore`. Suficiente para indexación.

## Cloudinary como único pipeline de imágenes

**Decisión:** toda imagen pasa por Cloudinary. URLs externas eliminadas.  
**Por qué:** transformaciones automáticas (resize, format, quality), CDN incluido, evita hotlinking y problemas de CORS.  
**Descartado:** almacenamiento propio en servidor (sin CDN, problemas de espacio).

## MongoDB sin autenticación

**Decisión:** MongoDB corre sin usuario/contraseña.  
**Por qué:** puerto 27017 no expuesto al exterior, solo accesible dentro de la red Docker.  
**Riesgo:** si hay otro contenedor comprometido en la misma red, acceso total a la BD.  
**Pendiente:** añadir MONGO_INITDB_ROOT_USERNAME/PASSWORD.

## JWT en localStorage

**Decisión:** token JWT guardado en localStorage del navegador.  
**Por qué:** implementación inicial simple.  
**Riesgo:** vulnerable a XSS. Si hay XSS, el token se puede robar.  
**Pendiente:** migrar a HttpOnly cookie.

## Cloudflare SSL Flexible

**Decisión:** SSL termina en Cloudflare, tráfico interno HTTP.  
**Por qué:** servidor sin certificado propio instalado. Certbot está preparado pero no activo.  
**Consecuencia:** `api.liser.es` debe estar en modo proxied (naranja) en Cloudflare para funcionar.

## Docker snap → apt

**Decisión:** migración de Docker instalado vía snap a Docker instalado vía apt.  
**Por qué:** snap Docker tenía AppArmor bloqueando `SIGKILL` a contenedores, impidiendo deploys limpios.  
**Consecuencia no prevista:** pérdida de datos del volumen MongoDB (volumen del snap no compatible con apt). Backup manual necesario antes de cualquier migración de este tipo.

## Slugs inmutables

**Decisión:** el slug de una BagList se genera una sola vez al crear y nunca cambia.  
**Por qué:** SEO — cambiar el slug rompe URLs indexadas.  
**Consecuencia:** si el título cambia mucho, el slug puede quedar desactualizado, pero es preferible a perder el posicionamiento.

## IP dinámica Movistar

**Decisión:** servidor en red doméstica con IP dinámica.  
**Consecuencia:** cada vez que cambia la IP hay que actualizar el registro A en Cloudflare.  
**Pendiente:** migración a VPS con IP estática.
