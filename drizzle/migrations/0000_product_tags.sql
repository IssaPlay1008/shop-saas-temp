ALTER TABLE public.products ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}'::text[];
UPDATE public.products SET tags = ARRAY[type] WHERE type <> '' AND cardinality(tags) = 0;