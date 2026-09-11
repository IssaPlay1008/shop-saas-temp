import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, Minus, Plus, Share2, ShoppingBag } from "lucide-react";

import { resolveImage, type Product } from "@/lib/products";
import { useStore } from "@/lib/products-store";
import { useCart } from "@/lib/cart-context";
import { ProductGallery } from "@/components/product-gallery";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/producto/$id")({
  component: ProductPage,
  head: () => ({
    meta: [
      { title: "Producto — Catálogo" },
      {
        name: "description",
        content:
          "Detalle del producto: fotos, precio, disponibilidad y pedido directo por WhatsApp.",
      },
      { property: "og:title", content: "Producto — Catálogo" },
      {
        property: "og:description",
        content:
          "Detalle del producto: fotos, precio, disponibilidad y pedido directo por WhatsApp.",
      },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Producto — Catálogo" },
      {
        name: "twitter:description",
        content:
          "Detalle del producto: fotos, precio, disponibilidad y pedido directo por WhatsApp.",
      },
    ],
  }),
});

function ProductPage() {
  const { id } = Route.useParams();
  const { getProduct, hydrated, whatsappNumber } = useStore();
  const { add, setQuantity: setCartQty, items, count } = useCart();
  const navigate = useNavigate();

  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [copied, setCopied] = useState(false);

  const product = getProduct(id);

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-display italic text-muted-foreground">Cargando producto…</p>
      </div>
    );
  }

  if (!product || product.active === false) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-5 px-6 text-center">
        <h1 className="font-display italic text-2xl">Este producto ya no está disponible</h1>
        <Link
          to="/"
          className="px-5 py-3 rounded-sm bg-chrome text-primary-foreground text-[11px] font-bold uppercase tracking-[0.25em]"
        >
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const outOfStock = product.stock <= 0;
  const maxQty = Math.max(1, product.stock);

  const handleAdd = () => {
    if (outOfStock) return;
    const existing = items.find((i) => i.productId === product.id);
    if (existing) {
      setCartQty(product.id, existing.quantity + qty);
    } else {
      add(product.id);
      if (qty > 1) setCartQty(product.id, qty);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const handleWhatsApp = () => {
    const message = [
      `¡Hola! Me interesa este producto:`,
      "",
      `• ${qty}× ${product.name} — $${(product.price * qty).toFixed(2)}`,
      "",
      typeof window !== "undefined" ? window.location.href : "",
    ]
      .filter(Boolean)
      .join("\n");
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // cancelado
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-32 md:pb-16">
      <nav className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-foreground/10">
        <div className="mx-auto max-w-5xl px-4 py-3 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
          <button
            onClick={() => navigate({ to: "/" })}
            aria-label="Volver"
            className="size-10 shrink-0 flex items-center justify-center rounded-sm border border-foreground/15 hover:border-foreground/40 transition-colors"
          >
            <ArrowLeft className="size-4" strokeWidth={1.75} />
          </button>
          <p className="min-w-0 truncate text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            {product.type || "Producto"}
          </p>
          <Link
            to="/"
            aria-label="Ver carrito"
            className="relative size-10 shrink-0 flex items-center justify-center rounded-sm border border-foreground/15 hover:border-foreground/40 transition-colors"
          >
            <ShoppingBag className="size-4" strokeWidth={1.75} />
            {count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-chrome text-primary-foreground text-[10px] font-bold flex items-center justify-center font-mono">
                {count}
              </span>
            )}
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl md:px-6 md:py-10 animate-ritual-fade">
        <div className="md:grid md:grid-cols-2 md:gap-10 md:items-start">
          <div className="md:sticky md:top-24 md:rounded-sm md:overflow-hidden md:border md:border-foreground/10">
            <ProductGallery product={product} />
          </div>

          <div className="px-5 pt-6 md:px-0 md:pt-0">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="font-display italic text-3xl leading-tight">{product.name}</h1>
                {product.tagline && (
                  <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mt-2">
                    {product.tagline}
                  </p>
                )}
              </div>
              <button
                onClick={handleShare}
                aria-label="Compartir producto"
                className="size-10 shrink-0 flex items-center justify-center rounded-sm border border-foreground/15 hover:border-foreground/40 transition-colors"
              >
                {copied ? <Check className="size-4" /> : <Share2 className="size-4" strokeWidth={1.75} />}
              </button>
            </div>

            <div className="mt-5 flex items-center gap-4">
              <p className="font-mono text-2xl text-chrome">${product.price.toFixed(2)}</p>
              <span
                className={cn(
                  "text-[9px] uppercase tracking-[0.25em] px-2.5 py-1 rounded-full border",
                  outOfStock
                    ? "border-foreground/20 text-muted-foreground"
                    : product.stock <= 3
                      ? "border-chrome/50 text-chrome"
                      : "border-foreground/20 text-muted-foreground",
                )}
              >
                {outOfStock
                  ? "Agotado"
                  : product.stock <= 3
                    ? `Últimas ${product.stock} unidades`
                    : `${product.stock} disponibles`}
              </span>
            </div>

            {product.description && (
              <p className="mt-6 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            )}

            {product.usage && (
              <div className="mt-6 border-t border-foreground/10 pt-5">
                <h2 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground mb-2">
                  Detalles
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {product.usage}
                </p>
              </div>
            )}

            {!outOfStock && (
              <div className="mt-7 flex items-center gap-4">
                <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  Cantidad
                </span>
                <div className="flex items-center gap-2 bg-surface rounded-sm p-1 border border-foreground/10">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="size-8 flex items-center justify-center rounded-sm hover:bg-foreground/10"
                    aria-label="Reducir cantidad"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="text-sm font-mono w-6 text-center">{qty}</span>
                  <button
                    onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                    disabled={qty >= maxQty}
                    className="size-8 flex items-center justify-center rounded-sm hover:bg-foreground/10 disabled:opacity-30"
                    aria-label="Aumentar cantidad"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
              </div>
            )}

            <div className="hidden md:flex md:flex-col md:gap-3 md:mt-8">
              <ActionButtons
                outOfStock={outOfStock}
                added={added}
                onAdd={handleAdd}
                onWhatsApp={handleWhatsApp}
              />
            </div>

            <RelatedProducts product={product} />
          </div>
        </div>
      </main>

      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-md border-t border-foreground/10 px-4 pt-3 pb-5 flex flex-col gap-2">
        <ActionButtons
          outOfStock={outOfStock}
          added={added}
          onAdd={handleAdd}
          onWhatsApp={handleWhatsApp}
        />
      </div>
    </div>
  );
}

function ActionButtons({
  outOfStock,
  added,
  onAdd,
  onWhatsApp,
}: {
  outOfStock: boolean;
  added: boolean;
  onAdd: () => void;
  onWhatsApp: () => void;
}) {
  return (
    <>
      <button
        onClick={onAdd}
        disabled={outOfStock}
        className="w-full py-4 bg-chrome text-primary-foreground rounded-sm text-[11px] font-bold uppercase tracking-[0.25em] transition-transform active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {added && <Check className="size-4" />}
        {outOfStock ? "Agotado" : added ? "Añadido al pedido" : "Añadir al carrito"}
      </button>
      <button
        onClick={onWhatsApp}
        disabled={outOfStock}
        className="w-full py-3.5 rounded-sm border border-foreground/20 text-[11px] font-semibold uppercase tracking-[0.25em] flex items-center justify-center gap-2 disabled:opacity-40 active:scale-[0.98] transition-transform"
      >
        <WhatsAppIcon />
        Preguntar por WhatsApp
      </button>
    </>
  );
}

function RelatedProducts({ product }: { product: Product }) {
  const { getProduct } = useStore();
  const related = (product.related ?? [])
    .map((rid) => getProduct(rid))
    .filter((p): p is Product => Boolean(p) && p!.active !== false);

  if (related.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-[10px] font-semibold uppercase tracking-[0.25em] mb-4 text-muted-foreground">
        Combina con
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {related.map((r) => (
          <Link
            key={r.id}
            to="/producto/$id"
            params={{ id: r.id }}
            className="text-left group"
          >
            <div className="aspect-square w-full rounded-sm overflow-hidden bg-surface mb-2 border border-foreground/10">
              <img
                src={resolveImage(r.image)}
                alt={r.name}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <p className="text-xs font-display leading-tight">{r.name}</p>
            <p className="text-[10px] font-mono text-muted-foreground">${r.price.toFixed(2)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg className="size-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.63 1.438h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
