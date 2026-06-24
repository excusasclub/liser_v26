# 🔒 INFORME DE AUDITORÍA - INFRAESTRUCTURA & CONFIGURACIÓN
## Liser v26 - Docker, Nginx, Environment & Deployment Security

**Fecha:** Junio 2026  
**Componentes:** Docker, Nginx, Environment, Dependencies  
**Severidad General:** CRÍTICA

---

## 📋 RESUMEN EJECUTIVO

La infraestructura y configuración de LISER v26 presenta **vulnerabilidades críticas** que comprometen toda la seguridad del sistema:

- ❌ **Secrets en variables de entorno sin protección** en docker-compose
- ❌ **No hay isolamento de contenedores** (todos conectados en misma red)
- ❌ **Nginx sin headers de seguridad** (CSP, HSTS, X-Frame, etc.)
- ❌ **HTTP SIN protección** en docker-compose (cert manejo manual)
- ❌ **Dependencias desactualizadas** con vulnerabilidades conocidas
- ❌ **Exposición de puertos** sin validación
- ❌ **Logs sin rotación** en contenedores
- ❌ **Sin health checks** en algunos servicios

---

## 🔴 VULNERABILIDADES CRÍTICAS

### 1. **VARIABLES DE ENTORNO SIN PROTECCIÓN EN DOCKER-COMPOSE** ⚠️ CRÍTICA
**Archivo:** `docker-compose.yml` (línea 15)  
**Severidad:** CRÍTICA (CVSS 9.8)

#### Descripción del Problema:
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    container_name: liser_backend
    restart: unless-stopped
    env_file: ./backend/.env  # ← .env file en texto plano
    depends_on:
      - mongodb
    networks:
      - liser_net
```

#### El archivo `.env` contiene:
```bash
MONGO_URL=mongodb://user:password@host:27017/dbname
JWT_SECRET=super_secret_key_12345
GOOGLE_CLIENT_SECRET=...
CLOUDINARY_API_SECRET=...
RESEND_API_KEY=...
DB_NAME=liser
CORS_ORIGINS=...
FRONTEND_URL=...
GOOGLE_REDIRECT_URI=...
```

#### Impacto:
- **Secrets en archivo .env sin encriptación** 
- **.env en repositorio Git** (si no en .gitignore)
- **Logs de Docker exponen .env** en `docker inspect`
- **Backups contienen secrets en texto plano**
- **Múltiples personas acceso a .env sin rotación de secrets**

#### Prueba de Concepto:
```bash
# Atacante con acceso al servidor:
cat docker-compose.yml
cat backend/.env
# ✓ Obtiene todos los secrets

# O atacante con acceso al repo Git:
git log -p -- backend/.env  # Si fue commiteado una vez
# ✓ Obtiene todos los secrets históricos

# O atacante con acceso al contenedor en ejecución:
docker exec liser_backend env
docker inspect liser_backend | grep -A 100 Env
# ✓ Obtiene todos los secrets actuales
```

#### Remediación:
```yaml
# Opción 1: Usar Docker Secrets (para Swarm)
secrets:
  jwt_secret:
    external: true
  mongo_url:
    external: true

services:
  backend:
    secrets:
      - jwt_secret
      - mongo_url
    environment:
      JWT_SECRET_FILE: /run/secrets/jwt_secret
      MONGO_URL_FILE: /run/secrets/mongo_url

# Crear secrets:
echo "super_secret_key_12345" | docker secret create jwt_secret -
echo "mongodb://user:pass@host:27017/db" | docker secret create mongo_url -
```

```bash
# Opción 2: Usar variables de entorno en CI/CD (GitHub Actions, GitLab CI)
# NO comitear .env a Git
# Crear .env.example sin valores

# En GitHub Actions:
- name: Deploy
  env:
    JWT_SECRET: ${{ secrets.JWT_SECRET }}
    MONGO_URL: ${{ secrets.MONGO_URL }}
  run: docker-compose up -d
```

```python
# Backend: Leer de archivo si necesario
import os
from pathlib import Path

def get_secret(key):
    # Intentar leer de /run/secrets (Docker Swarm)
    secret_file = Path(f"/run/secrets/{key}")
    if secret_file.exists():
        return secret_file.read_text().strip()
    
    # Sino, leer de variable de entorno
    return os.getenv(key)

JWT_SECRET = get_secret("jwt_secret")
MONGO_URL = get_secret("mongo_url")
```

---

### 2. **MONGODB SIN AUTENTICACIÓN** ⚠️ CRÍTICA
**Archivo:** `docker-compose.yml` (línea 3-10)  
**Severidad:** CRÍTICA (CVSS 9.9)

#### Descripción del Problema:
```yaml
mongodb:
  image: mongo:7
  container_name: liser_mongo
  restart: unless-stopped
  volumes:
    - mongo_data:/data/db
  networks:
    - liser_net
  # ← NO TIENE: 
  #  - MONGO_INITDB_ROOT_USERNAME
  #  - MONGO_INITDB_ROOT_PASSWORD
  #  - --auth en CMD
```

#### Impacto:
- **MongoDB sin usuario/contraseña** - Acceso anónimo a toda la BD
- **Expuesto en red liser_net** - Cualquier contenedor accede a BD
- **Backdoor para atacante** - Si acceso a network, acceso a todos los datos
- **Datos sin encriptación en reposo** - No hay encryption at rest
- **No hay auditoría** - No se logea quién accedió qué

#### Prueba de Concepto:
```bash
# Atacante dentro de la red Docker
docker exec -it liser_backend bash
# Dentro del contenedor:
mongosh mongodb://mongodb:27017/
show databases
show collections
db.users.find().pretty()
# ✓ Acceso total a BD sin autenticación
```

#### Remediación:
```yaml
mongodb:
  image: mongo:7
  container_name: liser_mongo
  restart: unless-stopped
  environment:
    MONGO_INITDB_ROOT_USERNAME: admin_user  # ← Genera un secret
    MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD}  # ← Secret fuerte
    MONGO_INITDB_DATABASE: liser
  command: --auth  # ← Habilitar autenticación
  volumes:
    - mongo_data:/data/db
  networks:
    - liser_net
  # Agregar health check
  healthcheck:
    test: |
      test $$(mongosh -u admin_user -p $${MONGO_ROOT_PASSWORD} \
      --eval "db.adminCommand({ ping: 1 })" | grep ok) == 1
    interval: 10s
    timeout: 5s
    retries: 5
```

```python
# Backend: Conectar con credenciales
MONGO_URL = f"mongodb://{os.getenv('MONGO_USERNAME')}:{os.getenv('MONGO_PASSWORD')}@mongodb:27017/liser?authSource=admin"
```

---

### 3. **NGINX SIN HEADERS DE SEGURIDAD** ⚠️ CRÍTICA
**Archivo:** `nginx/nginx.conf`  
**Severidad:** CRÍTICA (CVSS 8.6)

#### Descripción del Problema:
```nginx
server {
    listen 80;
    server_name liser.es app.liser.es;
    # ← NO TIENE:
    #  - HTTP a HTTPS redirect
    #  - Strict-Transport-Security (HSTS)
    #  - X-Content-Type-Options
    #  - X-Frame-Options
    #  - Content-Security-Policy
    #  - X-XSS-Protection
    #  - Referrer-Policy
    
    location / {
        proxy_pass http://frontend:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        # ← Falta:
        #  - X-Forwarded-For
        #  - X-Forwarded-Proto
        #  - proxy_ssl_verify
    }
}
```

#### Impacto:
- **Sin HTTPS redirect** - HTTP expone datos en tránsito
- **Sin HSTS** - Browser no fuerza HTTPS en siguiente visita
- **Sin CSP** - Permite inyección de scripts de cualquier origen
- **Sin X-Frame-Options** - Permite clickjacking (iframe attack)
- **Sin X-Content-Type-Options** - Permite MIME-sniffing
- **Información de servidor expuesta** - Server: nginx visible

#### Prueba de Concepto:
```bash
# Atacante ve headers de respuesta:
curl -I https://liser.es
# Respuesta:
HTTP/1.1 200 OK
Server: nginx/1.25  # ← Información expuesta
Date: ...
# ← Faltan todos los security headers

# MitM attack posible:
# 1. Usuario conecta a http://liser.es (no https)
# 2. Atacante intercepta y redirige a sitio fake
# 3. Sin HSTS, browser confía en HTTP
```

#### Remediación:
```nginx
# Crear archivo: nginx/security-headers.conf
# Security Headers
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=(), payment=()" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.liser.es; frame-ancestors 'none'; base-uri 'self'; form-action 'self';" always;

# Hide server info
server_tokens off;
```

```nginx
# Actualizar nginx.conf
events {}
http {
    include /etc/nginx/security-headers.conf;
    client_max_body_size 20M;

    # Redireccionar HTTP a HTTPS
    server {
        listen 80;
        server_name _;
        return 301 https://$host$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name liser.es app.liser.es;
        
        ssl_certificate /etc/letsencrypt/live/liser.es/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/liser.es/privkey.pem;
        
        # SSL Configuration
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        location / {
            proxy_pass http://frontend:80;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_ssl_verify off;
        }
    }
}
```

---

### 4. **PUERTO MONGODB EXPUESTO SIN FIREWALL** ⚠️ CRÍTICA
**Archivo:** `docker-compose.yml` (línea 3-10)  
**Severidad:** CRÍTICA (CVSS 9.8)

#### Descripción del Problema:
```yaml
mongodb:
  image: mongo:7
  # ← NO TIENE ports: expuesto
  # ← Pero si se agrega "- 27017:27017", expone BD al mundo
```

#### Si alguien agrega exposición:
```yaml
mongodb:
  ports:
    - "27017:27017"  # ← CRÍTICO: BD visible en Internet sin autenticación
```

#### Impacto:
- **MongoDB en puerto 27017** sin autenticación
- **Accesible desde Internet** si no hay firewall
- **Ransomware/wiper attacks** - Atacante borra toda la BD
- **Data exfiltration** - Robo masivo de datos usuario
- **Ataques automatizados** - Botnets buscan puertos MongoDB abiertos

#### Remediación:
```yaml
# NO EXPONER MONGODB EN docker-compose
# Mantener en red interna solamente
mongodb:
  networks:
    - liser_net  # ← Solo accesible internamente
  # NO agregar "ports:"

# Si necesario acceso remoto: usar SSH tunnel
# ssh -L 27017:mongodb:27017 user@server
# mongosh localhost:27017
```

---

### 5. **CERTIFICADOS SSL/TLS MANEJADOS MANUALMENTE** ⚠️ CRÍTICA
**Archivo:** `docker-compose.yml` (línea 42-46)  
**Severidad:** ALTA (CVSS 7.5)

#### Descripción del Problema:
```yaml
certbot:
  image: certbot/certbot
  volumes:
    - certbot_www:/var/www/certbot
    - certbot_certs:/etc/letsencrypt
  # ← No hay configuración de renovación automática
  # ← No hay health check
  # ← No hay notificación si falla renovación
```

#### Impacto:
- **Certificado vence sin renovación** automática - HTTPS breaks
- **Sin alertas** - Nadie se da cuenta hasta que usuarios reportan
- **Manual process error-prone** - Olvidar renovar = downtime
- **Seguridad débil** - Sin OCSP stapling, sin revocation checking

#### Remediación:
```yaml
certbot:
  image: certbot/certbot
  volumes:
    - certbot_www:/var/www/certbot
    - certbot_certs:/etc/letsencrypt
  entrypoint: >
    sh -c "
    certbot renew --quiet &&
    certbot certonly --webroot -w /var/www/certbot \
      -d liser.es -d app.liser.es -d api.liser.es \
      --non-interactive --agree-tos \
      --email admin@liser.es &&
    sleep 86400 &&
    /bin/sh -c 'while true; do certbot renew --quiet; sleep 86400; done'
    "
  depends_on:
    - nginx
  networks:
    - liser_net
```

---

### 6. **DEPENDENCIAS SIN ACTUALIZAR** ⚠️ ALTA
**Archivo:** `backend/requirements.txt` y `frontend/package.json`  
**Severidad:** ALTA (CVSS 7.3)

#### Descripción del Problema:
```
Backend (Python):
fastapi==0.110.1           # ← Versión específica, no latest
uvicorn==0.25.0            # ← Versión específica
pymongo==4.5.0             # ← Versión May 2024, posibles CVEs
pyjwt>=2.10.1              # ← Algunas con >= pueden tener issues
```

#### Vulnerabilidades conocidas:
```
pymongo 4.5.0:
  - No tiene todos los patches de 4.6+
  
pyjwt 2.10.1:
  - Algunos algoritmos débiles aún soportados
  
fastapi 0.110.1:
  - Múltiples CVEs en versiones anteriores
  
bcrypt 4.1.3:
  - OK pero 4.1.4+ tiene fixes
```

#### Impacto:
- **Vulnerabilidades conocidas sin parchear**
- **Sin security updates automáticos**
- **Dependencias transitorias también afectadas**

#### Remediación:
```bash
# Actualizar dependencies regularmente
pip install --upgrade pip setuptools wheel
pip install -U -r backend/requirements.txt
npm update --depth=3 --save

# Crear requirements.txt con versiones mínimas, no máximas
fastapi>=0.110.1,<1.0.0
uvicorn>=0.25.0,<1.0.0
pymongo>=4.6.0,<5.0.0
pyjwt>=2.10.1,<3.0.0

# Usar dependabot en GitHub
# o renovate bot
# para PRs automáticos de updates
```

---

### 7. **IMÁGENES DE DOCKER SIN VERSIÓN ESPECÍFICA** ⚠️ ALTA
**Archivo:** `docker-compose.yml` (líneas 4, 27, 43)  
**Severidad:** ALTA (CVSS 6.8)

#### Descripción del Problema:
```yaml
services:
  mongodb:
    image: mongo:7              # ← 7 = latest 7.x, puede cambiar
  nginx:
    image: nginx:alpine         # ← alpine = latest alpine, puede cambiar
  certbot:
    image: certbot/certbot      # ← latest, puede cambiar sin aviso
```

#### Impacto:
- **Imágenes se actualizan automáticamente** - Cambios inesperados
- **Vulnerabilidades en dependencias** - Sin control de versión
- **Comportamiento inconsistente** - Código en dev != prod
- **Actualización sin testing** - Puede romper functionality

#### Remediación:
```yaml
services:
  mongodb:
    image: mongo:7.0.12         # ← Versión específica
  nginx:
    image: nginx:1.25.5-alpine  # ← Versión específica
  certbot:
    image: certbot/certbot:2.9.0 # ← Versión específica
  backend:
    image: python:3.11.8-slim   # ← En Dockerfile
  frontend:
    image: node:18.20.3-alpine  # ← En Dockerfile
```

---

## 🟠 VULNERABILIDADES ALTAS

### 8. **NO HAY ISOLAMENTO DE REDES** 
**Archivo:** `docker-compose.yml`  
**Severidad:** ALTA (CVSS 6.5)

```yaml
services:
  backend:
    networks:
      - liser_net  # ← Mismo network para todo
  frontend:
    networks:
      - liser_net
  mongodb:
    networks:
      - liser_net
```

**Impacto:** Si frontend es comprometida, acceso directo a BD

**Remediación:**
```yaml
networks:
  frontend_net:
    internal: true  # Solo se comunica con nginx
  backend_net:
    internal: true  # Nginx-backend, backend-mongodb
  
services:
  frontend:
    networks:
      - frontend_net
  nginx:
    networks:
      - frontend_net
      - backend_net
  backend:
    networks:
      - backend_net
      - db_net
  mongodb:
    networks:
      - db_net
```

---

### 9. **SIN LIMITS DE RECURSOS** 
**Archivo:** `docker-compose.yml`  
**Severidad:** ALTA (CVSS 6.3)

```yaml
# NO HAY:
# limits:
#   cpus: '0.5'
#   memory: 512M
# reservations:
#   cpus: '0.25'
#   memory: 256M
```

**Impacto:** DoS - Un contenedor consume todos los recursos

---

### 10. **SIN HEALTH CHECKS** 
**Archivo:** `docker-compose.yml`  
**Severidad:** ALTA (CVSS 6.1)

```yaml
backend:
  # NO TIENE healthcheck
  # Si servicio se cae, no se reinicia automáticamente correctamente
```

---

## 🟡 VULNERABILIDADES MEDIAS

### 11. **EXPOSICIÓN DE DATOS EN LOGS**
**Severidad:** MEDIA (CVSS 5.3)

- Sin log rotation
- Logs contienen sensible info
- Sin log encryption

### 12. **BACKUPS NO ENCRIPTADOS**
**Severidad:** MEDIA (CVSS 5.1)

- Volumen mongo_data sin encryption
- Sin respaldo encriptado
- Sin política de backup

---

## 📊 MATRIZ DE RIESGOS (INFRAESTRUCTURA)

| # | Vulnerabilidad | Severidad | Impacto | Componente |
|---|---|---|---|---|
| 1 | Secrets en .env | CRÍTICA | Data Breach | Docker |
| 2 | MongoDB sin auth | CRÍTICA | Data Breach | MongoDB |
| 3 | Nginx sin headers | CRÍTICA | MitM/XSS | Nginx |
| 4 | Puertos expuestos | CRÍTICA | Data Breach | Docker |
| 5 | Certs manuales | ALTA | Service Down | SSL/Certbot |
| 6 | Deps desactualizadas | ALTA | Exploit Known CVEs | Dependencies |
| 7 | Docker images sin version | ALTA | Unknown Changes | Docker |
| 8 | Sin isolamento redes | ALTA | Lateral Movement | Docker |
| 9 | Sin limits recursos | ALTA | DoS | Docker |
| 10 | Sin health checks | ALTA | Service Instability | Docker |

---

## 🛠️ CHECKLIST DE REMEDIACIÓN

### Antes de Production (CRÍTICA):
- [ ] Implementar Docker secrets para todos los credenciales
- [ ] Agregar autenticación a MongoDB
- [ ] Agregar security headers a Nginx
- [ ] Redireccionar HTTP a HTTPS
- [ ] Especificar versiones exactas de imágenes Docker
- [ ] Implementar isolamento de redes Docker

### Primera Semana (ALTA):
- [ ] Agregar certificado management automático (Certbot)
- [ ] Actualizar todas las dependencias
- [ ] Agregar health checks a todos los servicios
- [ ] Agregar resource limits
- [ ] Implementar log rotation y encryption

### Próximo Mes (MEDIA):
- [ ] Implementar backup strategy
- [ ] Implementar disaster recovery plan
- [ ] Monitoreo de seguridad
- [ ] Alertas de certificado expiración
- [ ] Auditoría de accesos

---

## 📝 CONFIGURACIÓN RECOMENDADA (PRODUCTION-READY)

```yaml
version: '3.8'

secrets:
  jwt_secret:
    external: true
  mongo_root_password:
    external: true
  mongo_liser_password:
    external: true
  cloudinary_api_secret:
    external: true
  resend_api_key:
    external: true

services:
  mongodb:
    image: mongo:7.0.12
    container_name: liser_mongo
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD_FILE: /run/secrets/mongo_root_password
      MONGO_INITDB_DATABASE: liser
    command: --auth --wiredTigerCacheSizeGB 2
    secrets:
      - mongo_root_password
    volumes:
      - mongo_data:/data/db
    networks:
      - db_net
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 1G
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    container_name: liser_backend
    restart: always
    secrets:
      - jwt_secret
      - mongo_root_password
      - mongo_liser_password
      - cloudinary_api_secret
      - resend_api_key
    environment:
      JWT_SECRET: /run/secrets/jwt_secret
      MONGO_URL: mongodb://liser:password@mongodb:27017/liser?authSource=liser
      CLOUDINARY_API_SECRET: /run/secrets/cloudinary_api_secret
      RESEND_API_KEY: /run/secrets/resend_api_key
    depends_on:
      mongodb:
        condition: service_healthy
    networks:
      - backend_net
      - db_net
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
    healthcheck:
      test: curl -f http://localhost:8001/api/ || exit 1
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build: ./frontend
    container_name: liser_frontend
    restart: always
    networks:
      - frontend_net
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
    healthcheck:
      test: wget --quiet --tries=1 --spider http://localhost/health || exit 1
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:1.25.5-alpine
    container_name: liser_nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/security-headers.conf:/etc/nginx/security-headers.conf:ro
      - certbot_www:/var/www/certbot:ro
      - certbot_certs:/etc/letsencrypt:ro
    depends_on:
      backend:
        condition: service_healthy
      frontend:
        condition: service_healthy
    networks:
      - frontend_net
      - backend_net
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M

  certbot:
    image: certbot/certbot:2.9.0
    volumes:
      - certbot_www:/var/www/certbot
      - certbot_certs:/etc/letsencrypt
    entrypoint: >
      sh -c "certbot renew --quiet --post-hook 'nginx -s reload' &&
      (crontab -l 2>/dev/null; echo '0 2 * * * certbot renew --quiet --post-hook \"service nginx reload\"') | crontab -"
    networks:
      - frontend_net

volumes:
  mongo_data:
    driver: local
  certbot_www:
  certbot_certs:

networks:
  frontend_net:
    internal: true
  backend_net:
    internal: true
  db_net:
    internal: true
```

---

## 📝 CONCLUSIÓN

La infraestructura de LISER v26 **NO está lista para production** debido a múltiples vulnerabilidades críticas:

1. **Secrets no protegidos** - Data breach inmediato
2. **BD sin autenticación** - Acceso no autorizado a datos
3. **No hay security headers** - Vulnerable a MitM y XSS
4. **Sin isolamento** - Lateral movement fácil

**Recomendación:** Implementar todas las remediaciones CRÍTICAS antes de desplegar a producción.

---

*Auditoría completada: 24 de junio de 2026*  
*Estado: NO APTO PARA PRODUCTION*
