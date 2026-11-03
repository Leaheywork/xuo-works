// Turns src/data/objects.json into supabase/seed.sql, which you paste into
// Supabase > SQL Editor to copy all your pieces into the database.
// Run:  node tools/make-seed.js
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const objects = JSON.parse(
  fs.readFileSync(path.join(root, "src/data/objects.json"), "utf8")
);

const q = (s) => "'" + String(s ?? "").replace(/'/g, "''") + "'";
const n = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

const rows = objects.map((o) => {
  const images =
    "array[" + (o.images || []).map(q).join(", ") + "]::text[]";
  const status = ["available", "in_bidding", "sold"].includes(o.status)
    ? o.status
    : "sold";
  return `(${q(o.id)}, ${q(o.title)}, ${n(o.price)}, ${q(o.materials)}, ${q(
    o.dimensions
  )}, ${n(o.weightKg)}, ${n(o.year)}, ${q(o.description)}, ${q(
    status
  )}, ${images})`;
});

const sql = `-- Copies all pieces into the database. Safe to run again: it updates existing pieces.
insert into public.objects
  (id, title, price, materials, dimensions, weight_kg, year, description, status, images)
values
${rows.join(",\n")}
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  materials = excluded.materials,
  dimensions = excluded.dimensions,
  weight_kg = excluded.weight_kg,
  year = excluded.year,
  description = excluded.description,
  status = excluded.status,
  images = excluded.images;
`;

fs.mkdirSync(path.join(root, "supabase"), { recursive: true });
fs.writeFileSync(path.join(root, "supabase/seed.sql"), sql);
console.log(`Wrote supabase/seed.sql with ${rows.length} pieces.`);
