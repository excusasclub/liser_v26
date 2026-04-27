# Liser ver2

**Liser** es una aplicación web desarrollada en **Django 5.2** que permite a influencers, creadores de contenido y cualquier usuario organizar y compartir **listas de productos**, llamadas **BagLists**, de manera visual, atractiva y estructurada.  

Los seguidores pueden ver estas listas, inspirarse, guardar productos o añadirlos a sus propias listas. Para los creadores, Liser facilita la gestión y monetización de recomendaciones.

---

## Características

- Crear y gestionar **BagLists** (listas de productos) con secciones y items.
- Configurar visibilidad de cada BagList: privada, no listada, registrada o pública.
- Snapshots de productos externos para mantener historial de información.
- Etiquetas (Tags) para organizar listas.
- Favoritos: usuarios pueden marcar BagLists y productos como favoritos.
- Sistema de **facetas** (Facet) para filtrar BagLists por: país, temporada, uso, duración.
- Campos personalizados en secciones de BagList (SectionFieldDef) para organizar información específica de cada producto.
- Gestión de usuarios mediante perfil (Profile).
- Interfaz de administración de Django lista para usar.

---

## Tecnologías

- **Python 3.11**
- **Django 5.2**
- Base de datos **MySQL**  
  (conexión: `host=75.102.57.151`, `database=elclubdelaexcusa_liserdb`, `user=elclubdelaexcusa_pedrodch`)
- Entorno virtual: **venv**
- Control de versiones: **Git & GitHub**
- Frontend: Tailwind CSS para UI

---

## Requisitos previos

- Python 3.11  
- MySQL  
- Git  

---

## Instalación y setup

Clonar el repositorio:

```
git clone https://github.com/excusasclub/liser_ver2.git
cd liser_ver2
```

Crear y activar el entorno virtual:

```
# Crear entorno virtual
python -m venv venv

# Windows PowerShell
.\venv\Scripts\Activate.ps1

# Windows CMD
venv\Scripts\activate

# Linux/macOS
source venv/bin/activate
```

Instalar dependencias:

```
pip install -r requirements.txt
```

Configurar la base de datos en `settings.py`.

Aplicar migraciones:

```
python manage.py makemigrations
python manage.py migrate
```

Crear superusuario:

```
python manage.py createsuperuser
```

Iniciar servidor:

```
python manage.py runserver
```

Acceder al admin en:  
http://127.0.0.1:8000/admin/

---

## Estructura del proyecto

proyect_liser_ver2/
│
├─ accounts/          # Modelos de usuarios y perfiles  
├─ common/            # Modelos base y utilidades  
├─ catalog/           # Productos externos  
├─ lists/             # BagLists, secciones, items, facetas, tags  
├─ analytics/         # Modelos y lógica analítica  
├─ api/               # Endpoints y API  
├─ manage.py  
├─ requirements.txt  
└─ README.md  

---

## Modelos principales

### BagLists
- **BagList**: lista de productos de un usuario.  
- **BagListSection**: secciones dentro de la lista.  
- **BagListItem**: producto dentro de la sección.  
- **BagListItemProductSnapshot**: snapshot de producto externo.  
- **Tag / BagListTag**: etiquetado de listas.  
- **FavoriteBagList / FavoriteProduct**: favoritos de usuarios.  

### Facetas
- **Facet**: tipo de faceta (country, season, use, duration).  
- **FacetOption**: opciones de faceta (ej. España, Verano).  
- **BagListFacetValue**: valores asignados a cada BagList.  

### Campos de sección
- **SectionFieldDef**: definición de campo personalizado.  
- **BagListItemFieldValue**: valor concreto para un producto en la sección.  

---

## Administración

El proyecto utiliza el admin estándar de Django.  

Los modelos principales ya están registrados.  

URL de admin local:  
http://127.0.0.1:8000/admin/  

Permite gestionar usuarios, BagLists, productos, facetas, tags, favoritos, etc.  

---

## GitHub

Repositorio oficial:  
https://github.com/excusasclub/liser_ver2  

Branch principal: `main`  

Commit inicial: proyecto Django ver2 completo con modelos, apps y configuración básica.  

---

## Licencia

Este proyecto está bajo la licencia MIT.  
Ver el archivo LICENSE para más información.  

---

## Contacto

Email: elclubdelaexcusa@gmail.com  
GitHub: [@excusasclub](https://github.com/excusasclub)
