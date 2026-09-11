# Bandittzshop.com — de inciensos a joyería

Convertimos la base actual en una tienda de joyería con identidad propia: negro profundo, acentos plata y sin modo claro.

## 1. Marca

- "Ánima" pasa a ser **Bandittzshop.com** en la portada, el panel /admin y el título de la pestaña.
- Nuevo logo/monograma en la barra superior (marca "B" en plata, en vez del círculo de incienso).
- Textos de la página y del mensaje de WhatsApp adaptados a joyería (nada de "aroma" ni "intención").
- Título y descripción para compartir en WhatsApp/Google: "Bandittzshop.com — Joyería" con copy de joyería.

## 2. Solo modo oscuro, negro-gris real

- Se elimina el botón de sol/luna y el modo claro completo. La app arranca y se queda en oscuro.
- La paleta marrón/terracota se reemplaza por:
  - Fondo casi negro (#0A0A0B), tarjetas gris muy oscuro (#17181A).
  - Acento plata/cromo (#C3C7CC) para precios, chips activos y botones.
  - Texto principal blanco frío (#F2F3F5).
- Bordes finos claros, sombras profundas y un leve brillo metálico en botones y en el precio.

## 3. Estilo de joyería

- Fichas de producto más altas y con más aire (formato retrato), imagen sobre fondo oscuro y esquinas menos redondeadas para un aire más editorial/premium.
- Tipografía: display serif fina para el nombre de la marca y títulos, sans neutra en mayúsculas espaciadas para etiquetas y precios.
- Detalle de producto en hoja deslizante con precio destacado, material y botón de compra en plata.
- Micro-animaciones sobrias: aparición suave y leve zoom en la imagen al pasar el cursor.

## 4. Etiquetas simplificadas

- Se quita por completo el concepto de **Intenciones** (filtros, chips, buscador y formulario del panel).
- Queda un solo eje: **Etiquetas** (antes "Tipos"), ej. Anillos, Cadenas, Aretes, Pulseras.
- El buscador filtra por nombre y etiqueta.

## 5. Catálogo de ejemplo

- Se reemplazan los 6 inciensos por 6 piezas de joyería de muestra con imágenes generadas (anillo, cadena cubana, aretes, pulsera, dije, set), con precios y stock de ejemplo, listos para editar desde /admin.

## Detalles técnicos

- `src/styles.css`: se reescriben los tokens OKLCH; los valores oscuros pasan a `:root` y se elimina la dependencia de la clase `.dark`; nuevos pares de fuentes vía `<link>` en `__root.tsx`.
- `src/lib/theme.tsx` y `src/components/theme-toggle.tsx` se eliminan (o quedan fijados en oscuro) y se quita el `ThemeProvider` de `__root.tsx`.
- `src/routes/index.tsx`: marca, copy, tarjetas, detalle y chips; se elimina el uso de `intentions`.
- `src/routes/admin.tsx`: se quita el campo "Intenciones" del formulario y su columna de la lista.
- Migración: la columna `intentions` de `products` se deja en la base pero sin uso (se vacía en el sembrado nuevo); INSERTs literales con las 6 piezas nuevas y las imágenes de muestra.
- Imágenes de incienso en `src/assets` se retiran junto con su mapa `SEED_IMAGES`.
