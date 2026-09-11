# Desplegar Bandittzshop en Netlify con tu propio Supabase

Objetivo: que la app funcione fuera de Lovable (login de admin + imágenes) usando un proyecto Supabase tuyo y almacenamiento de archivos real.

## Por qué falla hoy

- El login de admin y todas las operaciones del panel usan la clave de servicio de Supabase que gestiona Lovable; esa clave no se puede exportar, así que en Netlify el servidor no puede validar credenciales ni escribir en la base.
- Las fotos se guardan como texto base64 dentro de la fila del producto (no hay archivos). Eso hace filas enormes y cargas lentas; además dependen de la misma base.
- El build actual apunta al runtime de Cloudflare; Netlify necesita su propio adaptador.

## Qué haremos

### 1. Tu proyecto Supabase
- Tú creas el proyecto en supabase.com y me pasas: URL, clave publishable (anon) y clave de servicio (esta última la guardamos como secreto, nunca en el código).
- Genero un script SQL único que recrea todo: tablas `products`, `product_types`, `settings`, sus permisos y políticas, el trigger de `updated_at`, y los datos actuales (productos, tipos, teléfono de tickets, usuario alternativo).
- Genero también el script para crear el bucket público `product-images` con sus políticas (lectura pública, escritura solo desde el servidor).

### 2. Imágenes en Storage
- El panel dejará de convertir a base64: subirá el archivo al bucket y guardará solo la URL pública.
- La subida pasa por una función de servidor que valida credenciales de admin antes de escribir, y borra el archivo del bucket cuando se elimina la imagen.
- Script de migración para pasar las imágenes base64 existentes a archivos del bucket y actualizar los productos.

### 3. Login de admin robusto fuera de Lovable
- Las credenciales seguirán viniendo de variables de entorno (`ADMIN_USER` / `ADMIN_PASSWORD`) más las credenciales alternativas guardadas en la tabla `settings`.
- Si falta alguna variable, el login mostrará un mensaje claro ("configuración del servidor incompleta") en lugar de fallar en blanco.
- Las contraseñas alternativas pasarán a guardarse con hash en vez de texto plano.

### 4. Configuración de Netlify
- Añadir `netlify.toml` y cambiar el destino de build de Cloudflare a Netlify (preset de Nitro `netlify`), para que las funciones de servidor se desplieguen como Netlify Functions.
- Lista de variables a cargar en Netlify → Site settings → Environment variables:
  `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_USER`, `ADMIN_PASSWORD`.
- Comando de build `npm run build`, carpeta de publicación la que genere el adaptador.
- Recordatorio: cambiar `user` / `123456` por credenciales reales antes de publicar.

## Detalles técnicos

- `src/lib/admin.functions.ts`: nueva `adminUploadImage` (valida credenciales, sube a `product-images` con `supabaseAdmin`, devuelve URL pública) y `adminDeleteImage`; hash de contraseña alternativa con SHA-256 + sal.
- `src/routes/admin.tsx`: el input de archivo llama a la función de subida en vez de `canvas.toDataURL` (se mantiene el redimensionado antes de subir para no mandar fotos de 5 MB).
- `vite.config.ts`: `nitro: { preset: "netlify" }` vía `defineConfig`.
- Se entregan los scripts SQL en `supabase/export/` para que los pegues en el editor SQL de tu proyecto.
- La app seguirá funcionando en el preview de Lovable mientras tanto (misma variable `SUPABASE_URL`, solo cambia el valor).
