# glosario.md

## Entidades principales

**BagList**  
Lista curada de productos creada por un usuario. Tiene título, descripción, categoría, cover image, tags, y un array de productos embebidos. URL pública: `liser.es/{username}/{slug}`.

**Producto**  
Ítem dentro de una BagList. Tiene nombre, descripción, imagen, precio, enlace de afiliado, código de descuento, campos personalizados y enlaces a RRSS. No tiene colección propia — vive embebido en la BagList.

**Slug**  
Identificador URL amigable de una BagList. Generado automáticamente del título al crear. Inmutable.

**Follower**  
Email capturado de un visitante no registrado que decide seguir una BagList. Almacenado en colección `followers`. Distinto de "usuario registrado".

**Click**  
Evento registrado cuando un visitante pulsa en un enlace de afiliado de un producto. Almacenado en colección `clicks` con TTL de 365 días. No se registran clics propios (owner).

**Favorito**  
Me gusta de un usuario registrado en una BagList ajena. Colección `favorites`.

**Guardado / Save**  
BagList guardada por un usuario registrado para consultar después. Colección `saves`.

**Plan**  
Nivel de suscripción del usuario: `free`, `pro`, `premium`. Actualmente sin diferenciación funcional activa (monetización bloqueada hasta autónomo).

**Featured**  
Campo booleano en BagList. Las BagLists con `featured: true` aparecen en la sección destacadas de ExplorePage. Se activa desde el backoffice admin.

**Prerender**  
HTML estático generado por el backend y servido a crawlers (Googlebot, ClaudeBot, GPTBot, etc.) en lugar del React vacío. Incluye title, meta tags y JSON-LD Schema.org.

## Roles de usuario

- `user` — usuario estándar
- `admin` — acceso al backoffice `/admin`

## Categorías (fijas en config.py)

Tech, Fashion, Hogar, Belleza, Deportes, Cocina, Viajes, Libros, Gaming, Lifestyle, Otros

## Siglas y términos técnicos internos

- **MoR** — Merchant of Record (Polar.sh, pendiente)
- **RRSS** — Redes Sociales
- **TTL** — Time To Live (índice de MongoDB para expirar documentos automáticamente)
- **CRA** — Create React App (base del frontend)
- **CRACO** — Create React App Configuration Override (permite alias @/)
- **deploy.sh** — script bash en el servidor que hace git pull + docker compose up
- **make_admin.py** — script Python para dar rol admin a un username desde CLI
- **migrate.py** — script Python para migraciones manuales de datos en MongoDB
