-- Bandittzshop — datos actuales (ejecutar después de 01-esquema.sql)

INSERT INTO public.product_types (name) VALUES
  ('Anillos'), ('Cadenas'), ('Aretes'), ('Pulseras'), ('Dijes'), ('Sets')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.products
  (id, name, price, image, images, type, tagline, description, usage, stock, active, related)
VALUES
  (
    'anillo-diamantado-de-cruz-plateado',
    'Anillo diamantado de cruz plateado',
    12,
    'storage:1786765851341-8qfw6o.jpg',
    ARRAY['storage:1786765851341-8qfw6o.jpg','storage:1788293250654-0hui0o.jpg'],
    'Anillos',
    'Anillo de cruz plateado con brillo iced out',
    '', '', 10, true, '{}'
  ),
  (
    'combo-1',
    'Combo 1',
    25,
    'storage:1786765898364-egawkg.jpg',
    ARRAY['storage:1786765898364-egawkg.jpg'],
    'Sets',
    'Cadena y pulsera tennis de cruz.',
    '', '', 2, true, '{}'
  )
ON CONFLICT (id) DO NOTHING;

-- Teléfono de los tickets de WhatsApp
INSERT INTO public.settings (key, value) VALUES ('whatsapp_number', '584129912415')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Credenciales alternativas del panel: NO se copian por seguridad.
-- Se crean desde el propio panel (botón de la llave) y quedan guardadas con hash.
