# Estudio Jurídico Ab. Josué Álvarez

Plataforma web full-stack para el estudio: sitio público editorial, directorio profesional, solicitudes de consulta, PWA instalable, asistente guiado y CMS privado.

## Inicio local

Requisitos: Node.js 22 o superior.

```bash
npm install
npm run db:migrate
npm run dev
```

Abra `http://localhost:3000`. El primer ingreso en `/login` crea la cuenta propietaria; después, esa misma pantalla funciona como acceso normal.

## Configuración

Copie `.env.example` a `.env.local` en una instalación nueva y complete:

- `DATABASE_URL`: conexión PostgreSQL de Supabase. Solo se usa en el servidor.
- `NEXT_PUBLIC_SUPABASE_URL`: URL pública del proyecto.
- `SUPABASE_SERVICE_ROLE_KEY`: clave privada del servidor para guardar logos y fotografías en Supabase Storage. Nunca debe exponerse con el prefijo `NEXT_PUBLIC_`.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: clave pública/publishable para enlazar el login con Supabase Auth. Si queda vacía, el CMS mantiene autenticación propia segura en PostgreSQL con bcrypt y cookie HTTP-only.
- `SESSION_SECRET`: secreto aleatorio de 32 caracteres o más.
- `NEXT_PUBLIC_SITE_URL`: origen público del sitio.

La credencial real está en `.env.local`, archivo excluido de Git.

## Arquitectura

- `app/`: presentación, páginas App Router y endpoints HTTP.
- `components/`: interfaz pública, formularios y CMS.
- `core/domain/`: modelos del dominio.
- `core/application/`: casos de uso.
- `infrastructure/`: conexión PostgreSQL y repositorios.
- `database/schema.sql`: esquema idempotente, índices, RLS y contenido inicial.

## Capacidades del CMS

- Identidad del estudio: logotipo, nombre, textos, colores y datos de contacto. El logo se reutiliza en el sitio, login, pestaña del navegador y correos.
- Quiénes somos: rótulo, historia, imagen institucional y página editorial dedicada.
- Contacto: dirección y mapa embebido administrable de Google Maps, OpenStreetMap o Mapbox.
- Servicios legales: creación, edición, orden, publicación y eliminación.
- Abogados: biografía, especialidades, formación, fotografía, publicación y orden.
- Editorial: borradores, publicación, autor, categoría, portada y contenido.
- Usuarios: propietario, administrador y editor.
- Consultas: bandeja, estados revisada/agendada/resuelta/rechazada y respuestas HTML preestablecidas.
- Correo: SMTP cifrado, prueba de conexión, confirmación automática y plantillas editables.
- Archivos: imágenes JPG, PNG, WEBP o AVIF de hasta 5 MB. Con `SUPABASE_SERVICE_ROLE_KEY` se almacenan en el bucket público `legal-media`; sin ella se usa el respaldo PostgreSQL existente para no interrumpir el CMS.
- Biblioteca multimedia: inventario, proveedor, peso, usos activos y eliminación segura. Logos, retratos, portadas e imagen institucional también pueden desvincularse desde sus formularios.
- PWA: manifest, iconos de marca, instalación desde el navegador, acceso directo y respaldo offline para páginas visitadas.
- Asistente virtual: respuestas construidas con el contenido público de PostgreSQL, sin API de inteligencia artificial. Incluye dictado mediante Web Speech API y lectura con la síntesis de voz del navegador; la disponibilidad del reconocimiento depende del navegador y del sistema operativo.

## Activar el correo

Entre a `/admin`, abra **Correo SMTP**, complete servidor, puerto, usuario, contraseña y remitente, guarde y utilice **Enviar prueba**. Solo al activar esa configuración se envía la confirmación automática de nuevas consultas.

## Validación

```bash
npm run build
npm audit --omit=dev
```
