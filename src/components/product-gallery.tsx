import { useEffect, useRef, useState } from "react";

import { resolveImage, type Product } from "@/lib/products";
import { cn } from "@/lib/utils";

export function ProductGallery({ product }: { product: Product }) {
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
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
    setIndex(i);
  };

  if (images.length === 0) return <div className="aspect-[4/5] w-full bg-background" />;

  return (
    <div className="relative">
      <div
        ref={trackRef}
        onScroll={(e) => {
          const el = e.currentTarget;
          const i = Math.round(el.scrollLeft / Math.max(1, el.clientWidth));
          if (i !== index) setIndex(i);
        }}
        className="flex w-full overflow-x-auto snap-x snap-mandatory scrollbar-none"
        style={{ scrollbarWidth: "none" }}
      >
        {images.map((img, i) => (
          <div key={`${img}-${i}`} className="snap-center shrink-0 w-full aspect-[4/5] bg-background">
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
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Ver foto ${i + 1}`}
              className={cn(
                "size-1.5 rounded-full transition-all",
                i === index ? "bg-foreground w-4" : "bg-foreground/35",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
