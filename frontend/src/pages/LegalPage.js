import React from 'react';
import { useParams, Navigate } from 'react-router-dom';

const LEGAL_CONTENT = {
    'aviso-legal': {
        title: 'Aviso Legal',
        content: `
## 1. Datos identificativos

En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y Comercio Electrónico, se informa:

- **Titular:** Liser
- **Email de contacto:** hello@liser.es
- **Dominio:** liser.es

## 2. Objeto y ámbito de aplicación

El presente Aviso Legal regula el acceso y uso de la plataforma Liser (en adelante, "la Plataforma"), accesible a través de app.liser.es, mediante la cual los usuarios pueden crear y compartir listas de productos recomendados con enlaces de afiliado.

## 3. Condiciones de uso

El acceso y uso de la Plataforma atribuye la condición de usuario e implica la aceptación plena de las presentes condiciones. El usuario se compromete a hacer un uso adecuado de los contenidos y servicios, y en particular a no utilizarlos para actividades ilícitas o contrarias a la buena fe.

## 4. Propiedad intelectual

Los contenidos de la Plataforma, incluyendo textos, imágenes, diseño y código, son propiedad de Liser o de sus respectivos autores, y están protegidos por la legislación vigente en materia de propiedad intelectual e industrial.

## 5. Exclusión de responsabilidad

Liser no se responsabiliza de los daños y perjuicios de cualquier naturaleza que pudieran derivarse del acceso o uso de la Plataforma, ni de los contenidos publicados por terceros usuarios. Los enlaces de afiliado incluidos en las listas redirigen a tiendas externas sobre las que Liser no tiene control.

## 6. Legislación aplicable

Las presentes condiciones se rigen por la legislación española. Para la resolución de conflictos, las partes se someten a los Juzgados y Tribunales del domicilio del usuario.
    `
    },
    'privacidad': {
        title: 'Política de Privacidad',
        content: `
## 1. Responsable del tratamiento

- **Titular:** Liser
- **Email:** hello@liser.es

## 2. Datos que recopilamos

- **Datos de registro:** email, nombre de usuario y contraseña (cifrada).
- **Datos de uso:** listas creadas, productos añadidos, clics en enlaces.
- **Datos de seguimiento:** email opcional proporcionado voluntariamente al seguir una BagList.
- **Datos técnicos:** dirección IP, tipo de navegador, páginas visitadas.

## 3. Finalidad del tratamiento

- Gestionar el acceso y uso de la Plataforma.
- Enviar notificaciones sobre actualizaciones de listas seguidas (solo si el usuario ha dado su consentimiento).
- Mejorar la experiencia de usuario y el rendimiento de la Plataforma.
- Cumplir con obligaciones legales.

## 4. Base jurídica

El tratamiento se basa en la ejecución del contrato de prestación del servicio (Art. 6.1.b RGPD) y, en el caso de comunicaciones, en el consentimiento del usuario (Art. 6.1.a RGPD).

## 5. Conservación de datos

Los datos se conservan mientras la cuenta esté activa. El usuario puede solicitar la eliminación de su cuenta y datos en cualquier momento desde la configuración de la Plataforma o enviando un email a hello@liser.es.

## 6. Derechos del usuario

El usuario puede ejercer sus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a hello@liser.es.

## 7. Cookies

Consulta nuestra Política de Cookies para más información.

## 8. Transferencias internacionales

Los datos pueden ser procesados por proveedores de servicios ubicados fuera del EEE (como servicios de almacenamiento en la nube), siempre bajo garantías adecuadas conforme al RGPD.
    `
    },
    'cookies': {
        title: 'Política de Cookies',
        content: `
## 1. ¿Qué son las cookies?

Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web. Se utilizan para recordar tus preferencias y mejorar tu experiencia de navegación.

## 2. Cookies que utilizamos

### Cookies técnicas (necesarias)
- **liser_token:** almacena el token de sesión del usuario autenticado. Duración: sesión.
- **liser_theme:** almacena la preferencia de tema (claro/oscuro). Duración: 1 año.
- **liser_follower_modal:** evita mostrar el modal de seguimiento más de una vez. Duración: 1 año.

### Cookies de terceros
- **Cloudinary:** servicio de almacenamiento de imágenes. Puede establecer cookies propias al cargar imágenes.

## 3. Cómo gestionar las cookies

Puedes configurar tu navegador para rechazar o eliminar cookies. Ten en cuenta que desactivar las cookies técnicas puede afectar al funcionamiento de la Plataforma.

- [Chrome](https://support.google.com/chrome/answer/95647)
- [Firefox](https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web)
- [Safari](https://support.apple.com/es-es/guide/safari/sfri11471/mac)

## 4. Actualizaciones

Esta política puede actualizarse. Te recomendamos revisarla periódicamente.

## 5. Contacto

Para cualquier consulta: hello@liser.es
    `
    }
};

function renderMarkdown(text) {
    return text
        .split('\n')
        .map((line, i) => {
            if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-semibold mt-8 mb-3 font-['Outfit']">{line.replace('## ', '')}</h2>;
            if (line.startsWith('- **')) {
                const parts = line.replace('- ', '').split(':**');
                return <li key={i} className="ml-4 mb-1"><strong>{parts[0].replace('**', '')}:</strong>{parts[1]}</li>;
            }
            if (line.startsWith('- [')) {
                const match = line.match(/\[(.+?)\]\((.+?)\)/);
                if (match) return <li key={i} className="ml-4 mb-1"><a href={match[2]} target="_blank" rel="noopener noreferrer" className="text-primary underline">{match[1]}</a></li>;
            }
            if (line.startsWith('- ')) return <li key={i} className="ml-4 mb-1">{line.replace('- ', '')}</li>;
            if (line.trim() === '') return <br key={i} />;
            return <p key={i} className="mb-2 text-muted-foreground leading-relaxed">{line}</p>;
        });
}

export default function LegalPage() {
    const { page } = useParams();
    const content = LEGAL_CONTENT[page];
    if (!content) return <Navigate to="/404" />;

    return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold font-['Outfit'] mb-8">{content.title}</h1>
            <div className="prose prose-invert max-w-none">
                {renderMarkdown(content.content)}
            </div>
        </div>
    );
}