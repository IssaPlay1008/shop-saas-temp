import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { resolveImage, type Product } from "@/lib/products";
import { cn } from "@/lib/utils";

export function ProductGallery({ product, thumbnails = false }: { product: Product; thumbnails?: boolean }) {
  const images = (product.images?.length ? product.images : [product.image]).filter(Boolean);
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIndex(0);
    trackRef.current?.scrollTo({ left: 0 });
  }, [product.id]);

  const goTo = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const next = (i + images.length) % images.length;
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    setIndex(next);
  };

  if (images.length === 0) return <div className="aspect-[4/5] w-full bg-surface" />;

  return (
    <div className="relative group">
      <div
        ref={trackRef}
        onScroll={(e) => {
          const el = e.currentTarget;
          const i = Math.round(el.scrollLeft / Math.max(1, el.clientWidth));
          if (i !== index) setIndex(i);
        }}
        className="flex w-full overflow-x-auto snap-x snap-mandatory no-scrollbar"
      >
        {images.map((img, i) => (
          <div key={`${img}-${i}`} className="snap-center shrink-0 w-full aspect-[4/5] bg-surface">
            <img
              src={resolveImage(img)}
              alt={`${product.name} — foto ${i + 1}`}
              width={800}
              height={1000}
              loading={i === 0 ? "eager" : "lazy"}
              className="w-full h-full object-cover"
              draggable={false}
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Foto anterior"
            className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 size-9 rounded-full bg-background/80 backdrop-blur items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Foto siguiente"
            className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 size-9 rounded-full bg-background/80 backdrop-blur items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="size-4" />
          </button>

          {thumbnails ? (
            <div className="absolute bottom-3 inset-x-3 flex justify-center">
              <div className="flex gap-1.5 p-1.5 rounded-2xl bg-background/75 backdrop-blur-md max-w-full overflow-x-auto no-scrollbar">
                {images.map((img, i) => (
                  <button
                    key={`${img}-t${i}`}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`Ver foto ${i + 1}`}
                    className={cn(
                      "size-12 shrink-0 rounded-xl overflow-hidden border-2 transition-all",
                      i === index ? "border-primary" : "border-transparent opacity-60 hover:opacity-100",
                    )}
                  >
                    <img src={resolveImage(img)} alt="" className="w-full h-full object-cover" draggable={false} />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Ver foto ${i + 1}`}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === index ? "bg-foreground w-4" : "bg-foreground/35 w-1.5",
                  )}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
