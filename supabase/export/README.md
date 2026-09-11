# Migrar Bandittzshop a tu propio Supabase + Netlify

## 1. Crear el proyecto Supabase
1. Entra a supabase.com y crea un proyecto nuevo.
2. SQL Editor → pega y ejecuta `01-esquema.sql`, luego `02-datos.sql`.
3. Storage → New bucket → nombre exacto: `product-images`, **privado** (las fotos se
   sirven a través de la app en `/api/public/img/...`, no hace falta que sea público).
4. Project Settings → API: copia `Project URL`, la clave **publishable/anon** y la
   clave **service_role**.

## 2. Copiar las fotos actuales
Los productos guardan referencias tipo `storage:<archivo>.jpg`. Descarga cada archivo desde
la tienda actual y súbelo al bucket `product-images` de tu proyecto **con el mismo nombre**:

- https://bandittzshop.lovable.app/api/public/img/1786765851341-8qfw6o.jpg
- https://bandittzshop.lovable.app/api/public/img/1788293250654-0hui0o.jpg
- https://bandittzshop.lovable.app/api/public/img/1786765898364-egawkg.jpg

Si subes fotos nuevas desde el panel ya se guardan directamente en tu bucket.

## 3. Desplegar en Netlify
1. Conecta el repositorio en Netlify (el `netlify.toml` ya define el build).
2. Site settings → Environment variables, añade:

| Variable | Valor |
| --- | --- |
| `VITE_SUPABASE_URL` | Project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | clave publishable / anon |
| `SUPABASE_URL` | Project URL |
| `SUPABASE_PUBLISHABLE_KEY` | clave publishable / anon |
| `SUPABASE_SERVICE_ROLE_KEY` | clave service_role (secreta) |
| `ADMIN_USER` | usuario del panel |
| `ADMIN_PASSWORD` | contraseña del panel |

3. Deploy. Comando: `npm run build`, publicación: `dist/client` (ya configurado).

## Notas
- Cambia `user` / `123456` por credenciales reales antes de publicar.
- Desde el panel (botón de la llave) puedes crear un usuario alternativo; su contraseña
  se guarda con hash, no en texto plano.
- Si el login dice "Configuración del servidor incompleta", faltan `ADMIN_USER` /
  `ADMIN_PASSWORD` en Netlify.
