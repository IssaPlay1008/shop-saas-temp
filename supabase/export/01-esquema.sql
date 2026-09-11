-- Bandittzshop — esquema completo
-- Pégalo en: tu proyecto Supabase → SQL Editor → New query → Run

-- Trigger de updated_at ---------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Productos ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id text PRIMARY KEY,
  name text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  image text NOT NULL DEFAULT '',
  images text[] NOT NULL DEFAULT '{}'::text[],
  type text NOT NULL DEFAULT '',
  tagline text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  usage text NOT NULL DEFAULT '',
  stock integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  related text[] NOT NULL DEFAULT '{}'::text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read products" ON public.products;
CREATE POLICY "Public can read products" ON public.products FOR SELECT USING (true);

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tipos de producto -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_types (
  name text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.product_types TO anon, authenticated;
GRANT ALL ON public.product_types TO service_role;
ALTER TABLE public.product_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read types" ON public.product_types;
CREATE POLICY "Public can read types" ON public.product_types FOR SELECT USING (true);

-- Ajustes (teléfono de tickets, credenciales alternativas) ----------------
CREATE TABLE IF NOT EXISTS public.settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.settings TO anon, authenticated;
GRANT ALL ON public.settings TO service_role;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public can read whatsapp number" ON public.settings;
CREATE POLICY "public can read whatsapp number" ON public.settings
FOR SELECT TO anon, authenticated USING (key = 'whatsapp_number');
