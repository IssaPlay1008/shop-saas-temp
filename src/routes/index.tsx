import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Plus, X, Minus, ShoppingBag, Menu } from "lucide-react";

import { resolveImage, type Product } from "@/lib/products";
import { useStore } from "@/lib/products-store";
import { useCart } from "@/lib/cart-context";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ProductGallery } from "@/components/product-gallery";

const BRAND = "Tu tienda";

export const Route = createFileRoute("/")({
  component: CatalogPage,
  head: () => ({
    meta: [
      { title: "Catálogo" },
      {
        name: "description",
        content:
          "Catálogo de productos con stock real y pedido directo por WhatsApp.",
      },
      { property: "og:title", content: "Catálogo" },
      {
        property: "og:description",
        content:
          "Catálogo de productos con stock real y pedido directo por WhatsApp.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Catálogo" },
      {
        name: "twitter:description",
        content:
          "Catálogo de productos con stock real y pedido directo por WhatsApp.",
      },
    ],
  }),
});

function CatalogPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("Todo");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [view, setView] = useState<"inicio" | "articulos">("inicio");

  const { count } = useCart();
  const { visibleProducts, getProduct } = useStore();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return visibleProducts.filter((p) => {
      if (filter !== "Todo" && p.type !== filter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q)
      );
    });
  }, [query, filter, visibleProducts]);

  const detail = detailId ? getProduct(detailId) ?? null : null;

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <TopBar
        query={query}
        onQuery={setQuery}
        cartCount={count}
        onCart={() => setCartOpen(true)}
        onMenu={() => setMenuOpen(true)}
        view={view}
        onView={setView}
      />

      <div className="px-5 mt-7 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display italic text-2xl leading-none">
            {filter === "Todo" ? "Catálogo" : filter}
          </h2>
        </div>
        {filter !== "Todo" && (
          <button
            onClick={() => setFilter("Todo")}
            className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full border border-foreground/25 text-[9px] uppercase tracking-[0.25em]"
          >
            {filter}
            <X className="size-3" />
          </button>
        )}
      </div>

      <main
        className={cn(
          "mt-5 animate-ritual-fade",
          view === "inicio" ? "px-5 grid grid-cols-2 gap-3" : "px-5 flex flex-col divide-y divide-foreground/10",
        )}
      >
        {filtered.map((p) =>
          view === "inicio" ? (
            <ProductCard key={p.id} product={p} onOpen={() => setDetailId(p.id)} />
          ) : (
            <ProductRow key={p.id} product={p} onOpen={() => setDetailId(p.id)} />
          ),
        )}
        {filtered.length === 0 && (
          <div className="col-span-2 py-20 text-center text-muted-foreground font-display italic text-lg">
            No hay productos con esa búsqueda.
          </div>
        )}
      </main>

      {count > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-5 inset-x-5 z-30 bg-chrome text-primary-foreground rounded-sm py-4 px-6 flex items-center justify-between shadow-deep animate-ritual-slide"
        >
          <div className="flex items-center gap-3">
            <ShoppingBag className="size-4" strokeWidth={2} />
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">
              Ver pedido
            </span>
            <span className="bg-primary-foreground/15 text-[10px] px-2 py-0.5 rounded-full font-mono">
              {count}
            </span>
          </div>
          <CartTotalLabel />
        </button>
      )}

      <CategoriesDrawer
        open={menuOpen}
        onOpenChange={setMenuOpen}
        filter={filter}
        onFilter={(f) => {
          setFilter(f);
          setMenuOpen(false);
        }}
      />

      <ProductDetail
        product={detail ?? null}
        onClose={() => setDetailId(null)}
        onOpenOther={(id) => setDetailId(id)}
      />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </div>
  );
}

function CartTotalLabel() {
  const { total } = useCart();
  return <span className="font-mono text-sm tracking-tight">${total.toFixed(2)}</span>;
}

function CategoriesDrawer({
  open,
  onOpenChange,
  filter,
  onFilter,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  filter: string;
  onFilter: (f: string) => void;
}) {
  const { types, visibleProducts } = useStore();

  const entries = [
    { name: "Todo", count: visibleProducts.length, image: visibleProducts[0]?.image },
    ...types.map((t) => {
      const items = visibleProducts.filter((p) => p.type === t);
      return { name: t, count: items.length, image: items[0]?.image };
    }),
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[76vw] max-w-xs bg-surface border-r border-foreground/10 p-0 flex flex-col"
      >
        <div className="px-5 pt-6 pb-4">
          <SheetTitle className="font-display italic text-2xl font-medium">Categorías</SheetTitle>
          <SheetDescription className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground mt-1">
            Filtrar por
          </SheetDescription>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-foreground/10 border-y border-foreground/10">
          {entries.map((e) => (
            <button
              key={e.name}
              onClick={() => onFilter(e.name)}
              className={cn(
                "w-full flex items-center gap-3 px-5 py-4 text-left transition-colors",
                filter === e.name ? "bg-foreground/[0.06]" : "hover:bg-foreground/[0.03]",
              )}
            >
              <div className="size-11 shrink-0 rounded-sm overflow-hidden bg-background border border-foreground/10">
                {e.image && (
                  <img
                    src={resolveImage(e.image)}
                    alt=""
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-display italic text-lg leading-tight truncate">{e.name}</p>
                <p className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground mt-0.5">
                  {e.count} {e.count === 1 ? "producto" : "productos"}
                </p>
              </div>
            </button>
          ))}
        </div>

        <div className="px-5 py-5">
          <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
            Tu tienda
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function TopBar({
  query,
  onQuery,
  cartCount,
  onCart,
  onMenu,
  view,
  onView,
}: {
  query: string;
  onQuery: (v: string) => void;
  cartCount: number;
  onCart: () => void;
  onMenu: () => void;
  view: "inicio" | "articulos";
  onView: (v: "inicio" | "articulos") => void;
}) {
  return (
    <nav className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-foreground/10">
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <button
          onClick={onMenu}
          aria-label="Abrir categorías"
          className="size-10 shrink-0 flex items-center justify-center rounded-sm border border-foreground/15 hover:border-foreground/40 transition-colors"
        >
          <Menu className="size-4" strokeWidth={1.75} />
        </button>

        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
          <input
            type="text"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="buscar producto..."
            className="w-full bg-foreground/[0.05] border border-foreground/10 rounded-full py-2.5 pl-10 pr-4 text-sm focus:border-primary/50 outline-none placeholder:text-muted-foreground/60"
          />
        </div>

        <button
          onClick={onCart}
          aria-label="Ver carrito"
          className="relative size-10 shrink-0 flex items-center justify-center rounded-sm border border-foreground/15 hover:border-foreground/40 transition-colors"
        >
          <ShoppingBag className="size-4" strokeWidth={1.75} />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-chrome text-primary-foreground text-[10px] font-bold flex items-center justify-center font-mono">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      <div className="px-5 flex items-center justify-between gap-4">
        <div className="flex gap-6">
          {(["inicio", "articulos"] as const).map((v) => (
            <button
              key={v}
              onClick={() => onView(v)}
              className={cn(
                "pb-3 text-[10px] uppercase tracking-[0.25em] border-b transition-colors",
                view === v
                  ? "text-foreground border-foreground"
                  : "text-muted-foreground border-transparent hover:text-foreground/80",
              )}
            >
              {v === "inicio" ? "Inicio" : "Artículos"}
            </button>
          ))}
        </div>
        <span className="pb-3 font-display text-sm tracking-[0.12em] text-chrome whitespace-nowrap">
          CATÁLOGO
        </span>
      </div>
    </nav>
  );
}

function ProductCard({ product, onOpen }: { product: Product; onOpen: () => void }) {
  const { add } = useCart();
  const outOfStock = product.stock <= 0;

  return (
    <button
      onClick={onOpen}
      className={cn(
        "relative block w-full aspect-[3/4] bg-surface rounded-sm overflow-hidden border border-foreground/10 group text-left",
        outOfStock && "opacity-70",
      )}
    >
      <img
        src={resolveImage(product.image)}
        alt={product.name}
        loading="lazy"
        width={800}
        height={1000}
        className={cn(
          "absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[var(--ease-ritual)] group-hover:scale-[1.05]",
          outOfStock && "grayscale",
        )}
      />
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-background via-background/70 to-transparent" />

      {outOfStock ? (
        <span className="absolute top-3 left-3 text-[9px] font-semibold uppercase tracking-[0.25em] bg-background/80 px-2 py-1 rounded-sm">
          Agotado
        </span>
      ) : (
        <span
          role="button"
          aria-label={`Añadir ${product.name}`}
          onClick={(e) => {
            e.stopPropagation();
            add(product.id);
          }}
          className="absolute top-3 right-3 size-8 bg-background/70 backdrop-blur border border-foreground/20 rounded-sm flex items-center justify-center text-foreground active:scale-95 transition-transform"
        >
          <Plus className="size-4" strokeWidth={2} />
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 p-3">
        <h3 className="font-display italic text-[15px] leading-tight">{product.name}</h3>
        <p className="text-xs font-mono tracking-tight text-chrome mt-1">
          ${product.price.toFixed(2)}
        </p>
      </div>
    </button>
  );
}

function ProductRow({ product, onOpen }: { product: Product; onOpen: () => void }) {
  const { add } = useCart();
  const outOfStock = product.stock <= 0;

  return (
    <div className={cn("flex items-center gap-4 py-4", outOfStock && "opacity-60")}>
      <button onClick={onOpen} className="flex flex-1 items-center gap-4 min-w-0 text-left">
        <div className="size-16 shrink-0 rounded-sm overflow-hidden bg-surface border border-foreground/10">
          <img
            src={resolveImage(product.image)}
            alt={product.name}
            loading="lazy"
            className={cn("w-full h-full object-cover", outOfStock && "grayscale")}
          />
        </div>
        <div className="min-w-0">
          <h3 className="font-display italic text-base leading-tight truncate">{product.name}</h3>
          <p className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground mt-1 truncate">
            {product.type}
          </p>
        </div>
      </button>
      <span className="font-mono text-sm text-chrome shrink-0">${product.price.toFixed(2)}</span>
      {!outOfStock && (
        <button
          onClick={() => add(product.id)}
          aria-label={`Añadir ${product.name}`}
          className="size-9 shrink-0 flex items-center justify-center rounded-sm border border-foreground/15 active:scale-95 transition-transform"
        >
          <Plus className="size-4" strokeWidth={2} />
        </button>
      )}
    </div>
  );
}

function ProductDetail({
  product,
  onClose,
  onOpenOther,
}: {
  product: Product | null;
  onClose: () => void;
  onOpenOther: (id: string) => void;
}) {
  const { add } = useCart();
  const { getProduct } = useStore();
  const related = (product?.related ?? [])
    .map((id) => getProduct(id))
    .filter((p): p is Product => Boolean(p) && p!.active !== false);

  return (
    <Dialog open={Boolean(product)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="p-0 gap-0 max-w-md w-[calc(100vw-2rem)] rounded-sm border border-foreground/10 bg-surface overflow-hidden max-h-[92vh] overflow-y-auto shadow-deep [&>button[type=button]]:size-9 [&>button[type=button]]:bg-background/90 [&>button[type=button]]:rounded-sm [&>button[type=button]]:top-5 [&>button[type=button]]:right-5 [&>button[type=button]]:flex [&>button[type=button]]:items-center [&>button[type=button]]:justify-center [&>button[type=button]]:opacity-100 [&>button[type=button]]:border [&>button[type=button]]:border-foreground/15"
      >
        {product && (
          <div className="pb-8">
            <ProductGallery product={product} />

            <div className="px-6 pt-6">
              <div className="flex justify-between items-start mb-5 gap-4">
                <div className="min-w-0">
                  <DialogTitle className="font-display text-2xl font-medium mb-1 leading-tight">
                    {product.name}
                  </DialogTitle>
                  <p className="text-muted-foreground text-[10px] tracking-[0.25em] uppercase">
                    {product.tagline}
                  </p>
                </div>
                <p className="text-xl font-mono shrink-0 text-chrome">
                  ${product.price.toFixed(2)}
                </p>
              </div>

              <DialogDescription className="text-sm text-muted-foreground leading-relaxed mb-6">
                {product.description}
              </DialogDescription>





              <button
                disabled={product.stock <= 0}
                onClick={() => {
                  add(product.id);
                  onClose();
                }}
                className="w-full py-4 bg-chrome text-primary-foreground rounded-sm text-[11px] font-bold uppercase tracking-[0.25em] transition-transform active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {product.stock <= 0 ? "Agotado" : "Añadir al carrito"}
              </button>

              {related.length > 0 && (
                <div className="mt-10">
                  <h4 className="text-[10px] font-semibold uppercase tracking-[0.25em] mb-4 text-muted-foreground">
                    Combina con
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {related.map((r) => (
                      <button key={r.id} onClick={() => onOpenOther(r.id)} className="text-left group">
                        <div className="aspect-square w-full rounded-sm overflow-hidden bg-background mb-2 border border-foreground/10">
                          <img
                            src={resolveImage(r.image)}
                            alt={r.name}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        </div>
                        <p className="text-xs font-display leading-tight">{r.name}</p>
                        <p className="text-[10px] font-mono text-muted-foreground">
                          ${r.price.toFixed(2)}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function CartDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { detailedItems, total, count, setQuantity, remove, clear } = useCart();
  const { whatsappNumber } = useStore();
  const [name, setName] = useState("");

  const handleCheckout = () => {
    if (detailedItems.length === 0) return;
    const trimmedName = name.trim() || "Cliente";
    const lines = detailedItems.map(
      (i) => `• ${i.quantity}× ${i.product.name} — $${(i.quantity * i.product.price).toFixed(2)}`,
    );
    const message = [
      `¡Hola ${BRAND}! Soy ${trimmedName}.`,
      "",
      "Quisiera reservar estos productos:",
      ...lines,
      "",
      `*Total estimado: $${total.toFixed(2)}*`,
    ].join("\n");
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="bg-surface text-foreground border-t border-foreground/15 rounded-t-sm p-0 max-h-[92vh] flex flex-col"
      >
        <div className="h-1 w-12 bg-foreground/20 rounded-full mx-auto mt-4 mb-2 shrink-0" />

        <div className="px-6 pt-4 pb-3 flex justify-between items-baseline shrink-0">
          <SheetTitle className="text-xl font-display font-medium">
            Tu selección
            {count > 0 && (
              <span className="text-sm text-muted-foreground ml-2 font-sans">({count})</span>
            )}
          </SheetTitle>
          {detailedItems.length > 0 && (
            <button
              onClick={clear}
              className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground"
            >
              Vaciar
            </button>
          )}
        </div>
        <SheetDescription className="sr-only">
          Revisa los productos, ajusta cantidades y envía tu pedido por WhatsApp.
        </SheetDescription>

        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-4">
          {detailedItems.length === 0 && (
            <div className="py-16 text-center text-sm text-muted-foreground font-display italic">
              Aún no elegiste ningún producto.
            </div>
          )}
          {detailedItems.map((i) => (
            <div key={i.productId} className="flex items-center gap-4">
              <div className="size-14 shrink-0 rounded-sm overflow-hidden bg-background border border-foreground/10">
                <img
                  src={resolveImage(i.product.image)}
                  alt={i.product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-display truncate">{i.product.name}</p>
                <p className="text-xs text-muted-foreground font-mono">
                  ${i.product.price.toFixed(2)} c/u
                </p>
              </div>
              <div className="flex items-center gap-2 bg-background rounded-sm p-1 border border-foreground/10">
                <button
                  onClick={() => setQuantity(i.productId, i.quantity - 1)}
                  className="size-7 flex items-center justify-center rounded-sm hover:bg-foreground/10"
                  aria-label="Reducir cantidad"
                >
                  <Minus className="size-3" />
                </button>
                <span className="text-xs font-mono w-4 text-center">{i.quantity}</span>
                <button
                  onClick={() => setQuantity(i.productId, i.quantity + 1)}
                  disabled={i.quantity >= i.product.stock}
                  className="size-7 flex items-center justify-center rounded-sm hover:bg-foreground/10 disabled:opacity-30"
                  aria-label="Aumentar cantidad"
                >
                  <Plus className="size-3" />
                </button>
              </div>
              <button
                onClick={() => remove(i.productId)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Quitar"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="border-t border-foreground/10 px-6 pt-4 pb-8 space-y-4 shrink-0 bg-surface">
          <div>
            <label className="block text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
              Tu nombre
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 60))}
              placeholder="¿Cómo te llamas?"
              className="w-full bg-background border border-foreground/10 rounded-sm py-3 px-4 text-sm outline-none focus:border-primary/50 placeholder:text-muted-foreground/50"
            />
          </div>
          <div className="flex justify-between items-baseline py-1">
            <span className="text-muted-foreground text-[10px] uppercase tracking-[0.25em]">
              Total estimado
            </span>
            <span className="font-mono text-lg text-chrome">${total.toFixed(2)}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={detailedItems.length === 0}
            className="w-full py-4 bg-chrome text-primary-foreground rounded-sm text-[11px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
          >
            <WhatsAppIcon />
            Enviar pedido por WhatsApp
          </button>
          <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
            Se abrirá una conversación con el pedido pre-cargado. Confirmamos disponibilidad y
            envío por chat.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function WhatsAppIcon() {
  return (
    <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.63 1.438h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
