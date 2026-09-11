import { createServerFn } from "@tanstack/react-start";

import type { Product } from "./products";

interface Creds {
  user: string;
  password: string;
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(`bandittz::${value}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

type CredsState = "ok" | "invalid" | "unconfigured";

async function credsState(creds: Creds): Promise<CredsState> {
  const user = process.env["ADMIN_USER"];
  const password = process.env["ADMIN_PASSWORD"];
  const inputUser = creds.user?.trim() ?? "";

  // Credenciales de seguridad (variables de entorno)
  const envConfigured = Boolean(user && password);
  if (envConfigured && inputUser === user && creds.password === password) return "ok";

  // Credenciales alternativas guardadas desde el panel
  const db = await admin();
  const { data } = await db
    .from("settings")
    .select("key, value")
    .in("key", ["admin_user", "admin_password", "admin_password_hash"]);
  const map = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
  const altUser = map["admin_user"];
  const altHash = map["admin_password_hash"];
  const altPlain = map["admin_password"];
  const altConfigured = Boolean(altUser && (altHash || altPlain));

  if (!envConfigured && !altConfigured) return "unconfigured";
  if (!altConfigured || inputUser !== altUser) return "invalid";

  if (altHash) return (await sha256(creds.password)) === altHash ? "ok" : "invalid";
  return creds.password === altPlain ? "ok" : "invalid";
}

async function credsAreValid(creds: Creds): Promise<boolean> {
  return (await credsState(creds)) === "ok";
}

async function checkCreds(creds: Creds) {
  if (!(await credsAreValid(creds))) throw new Error("Credenciales incorrectas");
}

/** Devuelve ok:false en vez de lanzar, para no generar un error global en el cliente. */
export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((data: Creds) => data)
  .handler(async ({ data }) => {
    const state = await credsState(data);
    return { ok: state === "ok", unconfigured: state === "unconfigured" };
  });



/** Ajustes del panel: teléfono de los tickets y usuario alternativo. */
export const adminGetSettings = createServerFn({ method: "POST" })
  .inputValidator((data: Creds) => data)
  .handler(async ({ data }) => {
    await checkCreds(data);
    const db = await admin();
    const { data: rows } = await db.from("settings").select("key, value");
    const map = Object.fromEntries((rows ?? []).map((r) => [r.key, r.value]));
    return {
      phone: map["whatsapp_number"] ?? "",
      altUser: map["admin_user"] ?? "",
    };
  });

export const adminSetPhone = createServerFn({ method: "POST" })
  .inputValidator((data: Creds & { phone: string }) => data)
  .handler(async ({ data }) => {
    await checkCreds(data);
    const phone = data.phone.replace(/[^0-9]/g, "");
    if (phone.length < 8) throw new Error("Número no válido");
    const db = await admin();
    const { error } = await db
      .from("settings")
      .upsert({ key: "whatsapp_number", value: phone }, { onConflict: "key" });
    if (error) throw new Error(error.message);
    return { ok: true as const, phone };
  });

export const adminSetCredentials = createServerFn({ method: "POST" })
  .inputValidator((data: Creds & { newUser: string; newPassword: string }) => data)
  .handler(async ({ data }) => {
    await checkCreds(data);
    const newUser = data.newUser.trim();
    if (newUser.length < 3) throw new Error("Usuario muy corto");
    if (data.newPassword.length < 4) throw new Error("Contraseña muy corta");
    const db = await admin();
    const { error } = await db.from("settings").upsert(
      [
        { key: "admin_user", value: newUser },
        { key: "admin_password_hash", value: await sha256(data.newPassword) },
      ],
      { onConflict: "key" },
    );
    if (error) throw new Error(error.message);
    // Elimina cualquier contraseña antigua guardada en texto plano.
    await db.from("settings").delete().eq("key", "admin_password");

    return { ok: true as const };
  });


export const adminSaveProduct = createServerFn({ method: "POST" })
  .inputValidator((data: Creds & { product: Product }) => data)
  .handler(async ({ data }) => {
    await checkCreds(data);
    const p = data.product;
    const db = await admin();
    const { error } = await db.from("products").upsert({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.image ?? "",
      images: p.images ?? [],
      type: p.type ?? "",
      tagline: p.tagline ?? "",
      description: p.description ?? "",
      usage: p.usage ?? "",
      stock: p.stock ?? 0,
      active: p.active !== false,
      related: p.related ?? [],
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminDeleteProduct = createServerFn({ method: "POST" })
  .inputValidator((data: Creds & { id: string }) => data)
  .handler(async ({ data }) => {
    await checkCreds(data);
    const db = await admin();
    const { error } = await db.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminSetActive = createServerFn({ method: "POST" })
  .inputValidator((data: Creds & { id: string; active: boolean }) => data)
  .handler(async ({ data }) => {
    await checkCreds(data);
    const db = await admin();
    const { error } = await db
      .from("products")
      .update({ active: data.active })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

type Kind = "type";
const TABLE = "product_types";

export const adminAddTag = createServerFn({ method: "POST" })
  .inputValidator((data: Creds & { kind: Kind; name: string }) => data)
  .handler(async ({ data }) => {
    await checkCreds(data);
    const db = await admin();
    const { error } = await db
      .from(TABLE)
      .upsert({ name: data.name }, { onConflict: "name" });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminRenameTag = createServerFn({ method: "POST" })
  .inputValidator((data: Creds & { kind: Kind; oldName: string; newName: string }) => data)
  .handler(async ({ data }) => {
    await checkCreds(data);
    const db = await admin();
    const { error } = await db
      .from(TABLE)
      .upsert({ name: data.newName }, { onConflict: "name" });
    if (error) throw new Error(error.message);

    await db.from("products").update({ type: data.newName }).eq("type", data.oldName);
    await db.from(TABLE).delete().eq("name", data.oldName);
    return { ok: true as const };
  });

export const adminRemoveTag = createServerFn({ method: "POST" })
  .inputValidator((data: Creds & { kind: Kind; name: string }) => data)
  .handler(async ({ data }) => {
    await checkCreds(data);
    const db = await admin();
    const { error } = await db.from(TABLE).delete().eq("name", data.name);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/** Sube una imagen (data URL) al almacenamiento y devuelve la referencia "storage:<path>". */
export const adminUploadImage = createServerFn({ method: "POST" })
  .inputValidator((data: Creds & { dataUrl: string }) => data)
  .handler(async ({ data }) => {
    await checkCreds(data);
    const match = /^data:(image\/[a-z+]+);base64,(.+)$/i.exec(data.dataUrl);
    if (!match) throw new Error("Formato de imagen no válido");
    const contentType = match[1]!;
    const bytes = Buffer.from(match[2]!, "base64");
    const ext = contentType.split("/")[1]!.replace("jpeg", "jpg");
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const db = await admin();
    const { error } = await db.storage
      .from("product-images")
      .upload(path, bytes, { contentType, upsert: false });
    if (error) throw new Error(error.message);
    return { ref: `storage:${path}` };
  });
