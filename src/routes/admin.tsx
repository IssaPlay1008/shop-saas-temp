import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, X, ArrowLeft, Eye, EyeOff, LogOut, Upload, Camera, Image as ImageIcon, Smartphone, KeyRound } from "lucide-react";

import { useStore, saveAdminCreds, clearAdminCreds, getAdminCreds } from "@/lib/products-store";
import {
  adminLogin,
  adminUploadImage,
  adminGetSettings,
  adminSetPhone,
  adminSetCredentials,
} from "@/lib/admin.functions";
import { resolveImage, type Product } from "@/lib/products";
import { cn } from "@/lib/utils";

const AUTH_KEY = "bandittz-admin-auth-v1";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Bandittzshop.com — Admin" }, { name: "robots", content: "noindex" }] }),
});

function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setAuthed(localStorage.getItem(AUTH_KEY) === "1");
    setHydrated(true);
  }, []);

  if (!hydrated) return null;
  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

  return (
    <AdminDashboard
      onLogout={() => {
        localStorage.removeItem(AUTH_KEY);
        clearAdminCreds();
        setAuthed(false);
      }}
    />
  );
}

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState<null | "invalid" | "unconfigured" | "server">(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await adminLogin({ data: { user: user.trim(), password: pass } });
      if (!res.ok) {
        setError(res.unconfigured ? "unconfigured" : "invalid");
      } else {
        setError(null);
        saveAdminCreds(user.trim(), pass);
        localStorage.setItem(AUTH_KEY, "1");
        onLogin();
      }
    } catch {
      setError("server");
    }
    setBusy(false);
  };



  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5">
      <form
        onSubmit={submit}
        className="w-full max-w-sm bg-surface border border-foreground/10 rounded-sm p-8 shadow-deep space-y-6"
      >
        <div className="text-center space-y-2">
          <h1 className="font-display text-xl tracking-[0.12em] text-chrome">BANDITTZSHOP</h1>
          <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
            Panel de administración
          </p>
        </div>
        <div className="space-y-3">
          <input
            autoFocus
            value={user}
            onChange={(e) => {
              setUser(e.target.value);
              setError(null);
            }}
            placeholder="Usuario"
            className="w-full bg-background rounded-sm py-3 px-4 text-sm outline-none border border-foreground/10 focus:border-primary/40"
          />
          <input
            type="password"
            value={pass}
            onChange={(e) => {
              setPass(e.target.value);
              setError(null);
            }}
            placeholder="Contraseña"
            className="w-full bg-background rounded-sm py-3 px-4 text-sm outline-none border border-foreground/10 focus:border-primary/40"
          />
        </div>
        {error && (
          <p className="text-xs text-destructive text-center">
            {error === "unconfigured"
              ? "Configuración del servidor incompleta: faltan ADMIN_USER y ADMIN_PASSWORD."
              : error === "server"
                ? "No se pudo conectar con el servidor. Revisa las variables de entorno."
                : "Credenciales incorrectas"}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full py-4 bg-chrome text-primary-foreground rounded-sm text-[11px] font-bold uppercase tracking-[0.25em] active:scale-[0.98] transition-transform disabled:opacity-60"
        >
          {busy ? "Entrando…" : "Entrar"}
        </button>
        <Link
          to="/"
          className="block text-center text-[9px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground"
        >
          Volver al catálogo
        </Link>
      </form>
    </div>
  );
}

type Tab = "productos" | "tipos";

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>("productos");
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [credsOpen, setCredsOpen] = useState(false);

  const onOpenCreds = () => setCredsOpen(true);

  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-foreground/10 px-5 py-4 flex items-center justify-between gap-3">
        <Link
          to="/"
          className="flex items-center gap-2 text-[9px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Catálogo
        </Link>
        <h1 className="font-display text-sm tracking-[0.12em] text-chrome whitespace-nowrap">
          BANDITTZSHOP
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCreds}
            aria-label="Cambiar usuario y contraseña"
            title="Cambiar usuario y contraseña"
            className="size-9 flex items-center justify-center rounded-sm border border-foreground/15 text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
          >
            <KeyRound className="size-4" />
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground"
          >
            <LogOut className="size-4" /> Salir
          </button>
        </div>

      </header>

      <div className="px-5 pt-4">
        <div className="flex gap-6 border-b border-foreground/10 mb-6">
          {(["productos", "tipos"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "pb-3 text-[10px] uppercase tracking-[0.25em] border-b transition-colors -mb-px",
                tab === t
                  ? "text-foreground border-foreground"
                  : "text-muted-foreground border-transparent hover:text-foreground/80",
              )}
            >
              {t}
            </button>
          ))}
        </div>


        {tab === "productos" && (
          <ProductsPanel
            onCreate={() => setCreating(true)}
            onEdit={(p) => setEditing(p)}
            onPhone={() => setPhoneOpen(true)}
          />
        )}
        {tab === "tipos" && <TagListPanel kind="type" />}
      </div>

      {phoneOpen && <PhoneModal onClose={() => setPhoneOpen(false)} />}
      {credsOpen && <CredentialsModal onClose={() => setCredsOpen(false)} onLogout={onLogout} />}

      {(editing || creating) && (
        <ProductForm
          initial={editing}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
        />
      )}
    </div>
  );
}

function ProductsPanel({
  onCreate,
  onEdit,
  onPhone,
}: {
  onCreate: () => void;
  onEdit: (p: Product) => void;
  onPhone: () => void;
}) {
  const { products, toggleProductActive, deleteProduct } = useStore();

  return (
    <div className="space-y-3">
      <div className="flex items-stretch gap-2">
        <button
          onClick={onCreate}
          className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-foreground/15 rounded-sm text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground"
        >
          <Plus className="size-4" /> Nuevo producto
        </button>
        <button
          onClick={onPhone}
          aria-label="Cambiar número de teléfono de los tickets"
          title="Cambiar número de teléfono de los tickets"
          className="w-14 flex items-center justify-center border-2 border-foreground/15 rounded-sm text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
        >
          <Smartphone className="size-4" />
        </button>
      </div>

      {products.map((p) => {
        const inactive = p.active === false;
        return (
          <div
            key={p.id}
            className={cn(
              "flex items-center gap-3 p-3 bg-surface rounded-sm",
              inactive && "opacity-60",
            )}
          >
            <div className="size-14 shrink-0 rounded-xl overflow-hidden bg-muted">
              {p.image && (
                <img src={resolveImage(p.image)} alt="" className="w-full h-full object-cover" />
              )}
            </div>
            <button
              onClick={() => onEdit(p)}
              className="flex-1 min-w-0 text-left"
            >
              <p className="text-sm font-medium truncate">{p.name}</p>
              <p className="text-[11px] text-muted-foreground font-mono">
                ${p.price.toFixed(2)} · Stock {p.stock} · {p.type}
              </p>
            </button>
            <button
              onClick={() => toggleProductActive(p.id)}
              className="size-9 flex items-center justify-center rounded-full hover:bg-foreground/5 text-muted-foreground"
              aria-label={inactive ? "Activar" : "Desactivar"}
              title={inactive ? "Activar" : "Desactivar"}
            >
              {inactive ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
            <button
              onClick={() => {
                if (confirm(`¿Eliminar "${p.name}"?`)) deleteProduct(p.id);
              }}
              className="size-9 flex items-center justify-center rounded-full hover:bg-destructive/10 text-destructive"
              aria-label="Eliminar"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        );
      })}

      {products.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-8 italic font-display">
          No hay productos.
        </p>
      )}
    </div>
  );
}

function TagListPanel({ kind }: { kind: "type" }) {
  const store = useStore();
  const list: string[] = store.types;
  const add = store.addType;
  const rename = store.renameType;
  const remove = store.removeType;
  const [value, setValue] = useState("");

  const label = "tipo";

  return (
    <div className="space-y-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const v = value.trim();
          if (!v) return;
          void add(v);
          setValue("");
        }}
        className="flex gap-2"
      >
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={`Nuevo ${label}`}
          className="flex-1 bg-surface rounded-sm py-3 px-4 text-sm outline-none border border-foreground/10 focus:border-primary/40"
        />
        <button
          type="submit"
          className="px-5 rounded-sm bg-foreground text-background text-sm font-medium"
        >
          Añadir
        </button>
      </form>

      <div className="space-y-2">
        {list.map((item) => (
          <TagRow
            key={item}
            value={item}
            onRename={(v) => rename(item, v)}
            onRemove={() => {
              if (confirm(`¿Eliminar "${item}"? Se quitará de todos los productos.`)) {
                remove(item);
              }
            }}
          />
        ))}
        {list.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8 italic font-display">
            Sin {label}s.
          </p>
        )}
      </div>
    </div>
  );
}

function TagRow({
  value,
  onRename,
  onRemove,
}: {
  value: string;
  onRename: (v: string) => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => setDraft(value), [value]);

  return (
    <div className="flex items-center gap-2 p-2 bg-surface rounded-sm">
      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            const v = draft.trim();
            if (v && v !== value) onRename(v);
            setEditing(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            if (e.key === "Escape") {
              setDraft(value);
              setEditing(false);
            }
          }}
          className="flex-1 bg-background rounded-xl py-2 px-3 text-sm outline-none border border-primary/40"
        />
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="flex-1 text-left text-sm py-2 px-3"
        >
          {value}
        </button>
      )}
      <button
        onClick={onRemove}
        className="size-9 flex items-center justify-center rounded-full hover:bg-destructive/10 text-destructive"
        aria-label="Eliminar"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function ProductForm({
  initial,
  onClose,
}: {
  initial: Product | null;
  onClose: () => void;
}) {
  const { types, saveProduct, products, addType } = useStore();
  const isNew = !initial;

  const [name, setName] = useState(initial?.name ?? "");
  const [price, setPrice] = useState(initial?.price?.toString() ?? "0");
  const [stock, setStock] = useState(initial?.stock?.toString() ?? "0");
  const [images, setImages] = useState<string[]>(
    initial?.images?.length ? initial.images : initial?.image ? [initial.image] : [],
  );
  const [urlInput, setUrlInput] = useState("");
  const [type, setType] = useState(initial?.type ?? types[0] ?? "");
  const [tagline, setTagline] = useState(initial?.tagline ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [active, setActive] = useState(initial?.active !== false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newType, setNewType] = useState("");
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const createType = () => {
    const t = newType.trim();
    if (!t) return;
    if (!types.includes(t)) void addType(t);
    setType(t);
    setNewType("");
  };


  const handleFile = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await compressImage(file);
      const { ref } = await adminUploadImage({ data: { ...getAdminCreds(), dataUrl } });
      setImages((prev) => [...prev, ref]);
      setPickerOpen(false);
    } catch {
      // ignore
    }
    setUploading(false);
  };


  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    let id = initial?.id;
    if (!id) {
      const base = slugify(trimmedName) || `producto-${Date.now()}`;
      id = base;
      let n = 2;
      while (products.some((p) => p.id === id)) {
        id = `${base}-${n++}`;
      }
    }
    await saveProduct({
      id,
      name: trimmedName,
      price: Number(price) || 0,
      stock: Math.max(0, Math.floor(Number(stock) || 0)),
      image: images[0] ?? "",
      images,
      type: type || types[0] || "General",
      tagline: tagline.trim(),
      description: description.trim(),
      usage: initial?.usage ?? "",
      active,
      related: initial?.related ?? [],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <form
        onSubmit={submit}
        className="bg-surface w-full max-w-lg rounded-t-3xl sm:rounded-sm max-h-[92vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-surface px-5 py-4 flex items-center justify-between border-b border-foreground/5">
          <h2 className="font-display italic text-xl font-semibold">
            {isNew ? "Nuevo producto" : "Editar producto"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="size-9 flex items-center justify-center rounded-full hover:bg-foreground/5"
            aria-label="Cerrar"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          <Field label="Nombre">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="input"
            />
          </Field>

          {images.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <div
                  key={`${img}-${i}`}
                  className="relative shrink-0 aspect-square w-24 rounded-xl overflow-hidden bg-muted"
                >
                  <img src={resolveImage(img)} alt="" className="w-full h-full object-cover" />
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-background/80">
                      Portada
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 size-6 rounded-full bg-background/80 flex items-center justify-center"
                    aria-label="Quitar imagen"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <Field label="Fotos (la primera es la portada)">
            <div className="flex gap-2">
              <input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://... y presiona Añadir"
                className="input flex-1 min-w-0"
              />
              <button
                type="button"
                onClick={() => {
                  const u = urlInput.trim();
                  if (!u) return;
                  setImages((prev) => [...prev, u]);
                  setUrlInput("");
                }}
                className="shrink-0 px-3 rounded-xl border border-foreground/10 text-sm hover:bg-foreground/5"
              >
                Añadir
              </button>
              <button
                type="button"
                onClick={() => setPickerOpen((v) => !v)}
                className="shrink-0 px-3 rounded-xl border border-foreground/10 flex items-center gap-1.5 text-sm hover:bg-foreground/5"
              >
                <Upload className="size-4" />
                Subir
              </button>
            </div>
          </Field>

          {pickerOpen && (
            <div className="grid grid-cols-2 gap-2 -mt-2">
              <button
                type="button"
                onClick={() => cameraRef.current?.click()}
                className="flex items-center justify-center gap-2 rounded-xl border border-foreground/10 py-3 text-sm hover:bg-foreground/5"
              >
                <Camera className="size-4" /> Cámara
              </button>
              <button
                type="button"
                onClick={() => galleryRef.current?.click()}
                className="flex items-center justify-center gap-2 rounded-xl border border-foreground/10 py-3 text-sm hover:bg-foreground/5"
              >
                <ImageIcon className="size-4" /> Galería
              </button>
            </div>
          )}
          {uploading && <p className="text-xs text-muted-foreground">Procesando imagen…</p>}
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <input
            ref={galleryRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />


          <div className="grid grid-cols-2 gap-3">
            <Field label="Precio">
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="input font-mono"
              />
            </Field>
            <Field label="Stock">
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="input font-mono"
              />
            </Field>
          </div>

          <Field label="Tipo">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="input"
            >
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <div className="flex gap-2 mt-2">
              <input
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    createType();
                  }
                }}
                placeholder="Nuevo tipo…"
                className="input flex-1 min-w-0"
              />
              <button
                type="button"
                onClick={createType}
                className="shrink-0 px-3 rounded-xl border border-foreground/10 flex items-center gap-1.5 text-sm hover:bg-foreground/5"
              >
                <Plus className="size-4" /> Crear
              </button>
            </div>
          </Field>


          <Field label="Frase corta (tagline)">
            <input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="input"
            />
          </Field>

          <Field label="Descripción">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="input"
            />
          </Field>

          <label className="flex items-center gap-3 py-2">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="size-4"
            />
            <span className="text-sm">Activo (visible en catálogo)</span>
          </label>
        </div>

        <div className="sticky bottom-0 bg-surface px-5 py-4 border-t border-foreground/10 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3.5 rounded-sm border border-foreground/15 text-[10px] font-semibold uppercase tracking-[0.25em]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 py-3.5 rounded-sm bg-chrome text-primary-foreground text-[10px] font-bold uppercase tracking-[0.25em]"
          >
            Guardar
          </button>
        </div>


        <style>{`
          .input {
            width: 100%;
            background: hsl(var(--background));
            border: 1px solid rgb(from currentColor r g b / 0.1);
            border-radius: 0.9rem;
            padding: 0.7rem 0.9rem;
            font-size: 0.875rem;
            outline: none;
          }
          .input:focus { border-color: hsl(var(--primary) / 0.5); }
        `}</style>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function compressImage(file: File, max = 900, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read-error"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode-error"));
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("no-ctx"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

const modalInput =
  "w-full bg-background rounded-sm py-3 px-4 text-sm outline-none border border-foreground/10 focus:border-primary/40";

function ModalShell({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center px-5">
      <div className="w-full max-w-sm bg-surface border border-foreground/10 rounded-sm p-6 shadow-deep space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-base tracking-[0.12em] text-chrome">{title}</h2>
            <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground mt-1">
              {subtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="size-8 flex items-center justify-center rounded-sm hover:bg-foreground/5 text-muted-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function PhoneModal({ onClose }: { onClose: () => void }) {
  const { refresh } = useStore();
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void adminGetSettings({ data: getAdminCreds() })
      .then((s) => setPhone(s.phone))
      .catch(() => setMsg("No se pudieron cargar los ajustes"));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await adminSetPhone({ data: { ...getAdminCreds(), phone } });
      await refresh();
      setMsg("Número actualizado");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Error al guardar");
    }
    setBusy(false);
  };

  return (
    <ModalShell title="TELÉFONO" subtitle="Número de los tickets" onClose={onClose}>
      <form onSubmit={save} className="space-y-4">
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          inputMode="tel"
          placeholder="584129912415"
          className={modalInput}
        />
        <p className="text-[10px] text-muted-foreground">
          Formato internacional sin símbolos. Se usa para enviar los pedidos por WhatsApp.
        </p>
        {msg && <p className="text-xs text-center text-muted-foreground">{msg}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full py-3.5 bg-chrome text-primary-foreground rounded-sm text-[11px] font-bold uppercase tracking-[0.25em] disabled:opacity-60"
        >
          {busy ? "Guardando…" : "Guardar"}
        </button>
      </form>
    </ModalShell>
  );
}

function CredentialsModal({ onClose, onLogout }: { onClose: () => void; onLogout: () => void }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void adminGetSettings({ data: getAdminCreds() })
      .then((s) => setUser(s.altUser))
      .catch(() => setMsg("No se pudieron cargar los ajustes"));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pass !== pass2) {
      setMsg("Las contraseñas no coinciden");
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      await adminSetCredentials({
        data: { ...getAdminCreds(), newUser: user.trim(), newPassword: pass },
      });
      setMsg("Credenciales actualizadas. Vuelve a iniciar sesión.");
      setTimeout(onLogout, 1200);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Error al guardar");
      setBusy(false);
    }
  };

  return (
    <ModalShell title="ACCESO" subtitle="Usuario y contraseña" onClose={onClose}>
      <form onSubmit={save} className="space-y-3">
        <input
          value={user}
          onChange={(e) => setUser(e.target.value)}
          placeholder="Nuevo usuario"
          className={modalInput}
        />
        <input
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          placeholder="Nueva contraseña"
          className={modalInput}
        />
        <input
          type="password"
          value={pass2}
          onChange={(e) => setPass2(e.target.value)}
          placeholder="Repetir contraseña"
          className={modalInput}
        />
        <p className="text-[10px] text-muted-foreground">
          Se crea un acceso alternativo. El acceso de seguridad original seguirá funcionando.
        </p>
        {msg && <p className="text-xs text-center text-muted-foreground">{msg}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full py-3.5 bg-chrome text-primary-foreground rounded-sm text-[11px] font-bold uppercase tracking-[0.25em] disabled:opacity-60"
        >
          {busy ? "Guardando…" : "Guardar"}
        </button>
      </form>
    </ModalShell>
  );
}
