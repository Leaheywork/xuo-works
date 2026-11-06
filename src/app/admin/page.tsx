"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase, supabaseConfigured } from "@/lib/supabase";

const field = "w-full border border-hairline px-3 py-2 text-sm bg-background";
const label = "block text-[11px] font-mono uppercase tracking-wide text-steel mb-1";
const button =
  "border border-foreground px-4 py-2 text-[11px] font-mono uppercase tracking-wide hover:bg-foreground hover:text-background transition-colors disabled:opacity-40";

interface Piece {
  id: string;
  title: string;
  price: number;
  materials: string;
  dimensions: string;
  weight_kg: number;
  year: number;
  description: string;
  status: "available" | "in_bidding" | "sold";
  images: string[];
}

const EMPTY: Piece = {
  id: "",
  title: "",
  price: 0,
  materials: "",
  dimensions: "",
  weight_kg: 0,
  year: new Date().getFullYear(),
  description: "",
  status: "available",
  images: [],
};

function slug(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Shrinks big phone/camera photos before upload so pages load fast.
async function shrink(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const max = 2000;
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * scale);
  c.height = Math.round(bmp.height * scale);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  return new Promise((res, rej) =>
    c.toBlob((b) => (b ? res(b) : rej(new Error("Photo failed"))), "image/jpeg", 0.85)
  );
}

export default function AdminPage() {
  const [state, setState] = useState<"loading" | "out" | "no" | "admin">("loading");
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [form, setForm] = useState<Piece>(EMPTY);
  const [isNew, setIsNew] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const loadPieces = useCallback(async () => {
    const { data } = await supabase
      .from("objects")
      .select("*")
      .order("sort_order", { ascending: true });
    setPieces((data ?? []) as Piece[]);
  }, []);

  useEffect(() => {
    if (!supabaseConfigured) {
      setState("out");
      return;
    }
    (async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!user) return setState("out");
      const { data: p } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();
      if (p?.is_admin) {
        setState("admin");
        loadPieces();
      } else setState("no");
    })();
  }, [loadPieces]);

  function set<K extends keyof Piece>(k: K, v: Piece[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function edit(p: Piece) {
    setForm({ ...EMPTY, ...p });
    setIsNew(false);
    setMsg("");
    setErr("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setForm(EMPTY);
    setIsNew(true);
    setMsg("");
    setErr("");
  }

  async function onPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    const id = form.id || slug(form.title);
    if (!id) {
      setErr("Type the title first, then add photos.");
      return;
    }
    setBusy(true);
    setErr("");
    setMsg("Uploading photos…");
    const urls: string[] = [];
    try {
      for (const f of files) {
        const blob = await shrink(f);
        const path = `${id}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.jpg`;
        const { error } = await supabase.storage
          .from("objects")
          .upload(path, blob, { contentType: "image/jpeg" });
        if (error) throw error;
        urls.push(supabase.storage.from("objects").getPublicUrl(path).data.publicUrl);
      }
      setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
      setMsg("Photos added. Press Save to keep them.");
    } catch (x) {
      setErr(x instanceof Error ? x.message : "Upload failed");
      setMsg("");
    }
    setBusy(false);
  }

  function moveImage(i: number, d: number) {
    setForm((f) => {
      const a = [...f.images];
      const j = i + d;
      if (j < 0 || j >= a.length) return f;
      [a[i], a[j]] = [a[j], a[i]];
      return { ...f, images: a };
    });
  }

  function removeImage(i: number) {
    setForm((f) => ({ ...f, images: f.images.filter((_, k) => k !== i) }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const id = form.id || slug(form.title);
    if (!id || !form.title) {
      setErr("A title is needed.");
      return;
    }
    setBusy(true);
    setErr("");
    setMsg("");
    const row = {
      id,
      title: form.title,
      price: Number(form.price) || 0,
      materials: form.materials,
      dimensions: form.dimensions,
      weight_kg: Number(form.weight_kg) || 0,
      year: Number(form.year) || 0,
      description: form.description,
      status: form.status,
      images: form.images,
    };
    const { error } = await supabase.from("objects").upsert(row);
    if (error) setErr(error.message);
    else {
      setMsg("Saved. It is live within a minute.");
      setForm({ ...form, id });
      setIsNew(false);
      loadPieces();
    }
    setBusy(false);
  }

  async function remove() {
    if (!form.id) return;
    if (!window.confirm(`Delete "${form.title}" for good? This cannot be undone.`)) return;
    setBusy(true);
    const { error } = await supabase.from("objects").delete().eq("id", form.id);
    if (error) setErr(error.message);
    else {
      reset();
      setMsg("Deleted.");
      loadPieces();
    }
    setBusy(false);
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="uppercase tracking-wide text-sm font-semibold mb-6 border-b border-hairline pb-3">
        Admin
      </h1>

      {state === "loading" && <p className="text-sm text-steel">Loading&hellip;</p>}
      {state === "out" && (
        <p className="text-sm text-steel">
          Sign in on the <a href="/account" className="underline">Account</a> page first.
        </p>
      )}
      {state === "no" && (
        <p className="text-sm text-steel">This account is not an admin.</p>
      )}

      {state === "admin" && (
        <div className="grid md:grid-cols-[1fr_320px] gap-10">
          <form onSubmit={save} className="space-y-4">
            <h2 className="uppercase tracking-wide text-sm font-semibold">
              {isNew ? "New piece" : `Editing: ${form.title}`}
            </h2>

            <div>
              <span className={label}>Title</span>
              <input className={field} value={form.title} onChange={(e) => set("title", e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className={label}>Price (USD)</span>
                <input className={field} type="number" min="0" value={form.price} onChange={(e) => set("price", Number(e.target.value))} />
              </div>
              <div>
                <span className={label}>Status</span>
                <select className={field} value={form.status} onChange={(e) => set("status", e.target.value as Piece["status"])}>
                  <option value="available">Available</option>
                  <option value="in_bidding">In bidding</option>
                  <option value="sold">Gone</option>
                </select>
              </div>
            </div>

            <div>
              <span className={label}>Materials</span>
              <input className={field} value={form.materials} onChange={(e) => set("materials", e.target.value)} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className={label}>Dimensions</span>
                <input className={field} value={form.dimensions} onChange={(e) => set("dimensions", e.target.value)} />
              </div>
              <div>
                <span className={label}>Weight (kg)</span>
                <input className={field} type="number" step="0.1" min="0" value={form.weight_kg} onChange={(e) => set("weight_kg", Number(e.target.value))} />
              </div>
              <div>
                <span className={label}>Year</span>
                <input className={field} type="number" value={form.year} onChange={(e) => set("year", Number(e.target.value))} />
              </div>
            </div>

            <div>
              <span className={label}>Description</span>
              <textarea className={field} rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} />
            </div>

            <div>
              <span className={label}>Photos (first one is the cover)</span>
              <input type="file" accept="image/*" multiple onChange={onPhotos} disabled={busy} className="text-sm" />
              <div className="grid grid-cols-4 gap-2 mt-3">
                {form.images.map((src, i) => (
                  <div key={src + i} className="border border-hairline p-1 text-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="w-full aspect-square object-contain bg-white" />
                    <div className="flex justify-between text-[11px] font-mono mt-1">
                      <button type="button" onClick={() => moveImage(i, -1)}>&larr;</button>
                      <button type="button" onClick={() => removeImage(i)}>remove</button>
                      <button type="button" onClick={() => moveImage(i, 1)}>&rarr;</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 items-center pt-2">
              <button type="submit" disabled={busy} className={button}>
                {busy ? "…" : "Save"}
              </button>
              <button type="button" onClick={reset} className={button}>
                New piece
              </button>
              {!isNew && (
                <button type="button" onClick={remove} disabled={busy} className={button}>
                  Delete
                </button>
              )}
            </div>
            {msg && <p className="text-sm">{msg}</p>}
            {err && <p className="text-[11px] font-mono text-sold">{err}</p>}
          </form>

          <aside>
            <h2 className="uppercase tracking-wide text-sm font-semibold mb-3">
              All pieces
            </h2>
            <ul className="divide-y divide-hairline border border-hairline">
              {pieces.map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => edit(p)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-hairline/40"
                  >
                    {p.title}
                    <span className="block text-[11px] font-mono text-steel">
                      {p.status === "sold" ? "Gone" : p.status === "in_bidding" ? "In bidding" : "Available"} · ${p.price}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      )}
    </div>
  );
}
