import raw from "@/data/objects.json";
import { supabase, supabaseConfigured } from "./supabase";
import type { ObjectStatus, XuoObject } from "./types";

const FALLBACK = raw as XuoObject[];

interface Row {
  id: string;
  title: string;
  price: number | string;
  materials: string | null;
  dimensions: string | null;
  weight_kg: number | string | null;
  year: number | null;
  description: string | null;
  status: ObjectStatus;
  images: string[] | null;
  current_bid: number | string | null;
  bid_count: number | null;
  ends_at: string | null;
  sort_order: number | null;
}

function fromRow(r: Row): XuoObject {
  const hoursLeft = r.ends_at
    ? Math.max(0, (new Date(r.ends_at).getTime() - Date.now()) / 3600000)
    : undefined;
  return {
    id: r.id,
    title: r.title,
    price: Number(r.price) || 0,
    materials: r.materials ?? "",
    dimensions: r.dimensions ?? "",
    weightKg: Number(r.weight_kg) || 0,
    year: r.year ?? 0,
    description: r.description ?? "",
    status: r.status,
    images: r.images ?? [],
    currentBid: r.current_bid != null ? Number(r.current_bid) : undefined,
    bidCount: r.bid_count ?? undefined,
    hoursLeft,
  };
}

// Reads pieces from the database. If the database is not connected or
// returns nothing, falls back to the local list so the site never goes blank.
async function load(): Promise<XuoObject[]> {
  if (!supabaseConfigured) return FALLBACK;
  try {
    const { data, error } = await supabase
      .from("objects")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error || !data || data.length === 0) return FALLBACK;
    const order = new Map(FALLBACK.map((o, i) => [o.id, i]));
    const rows = (data as Row[]).slice().sort((a, b) => {
      const s = (a.sort_order ?? 0) - (b.sort_order ?? 0);
      if (s !== 0) return s;
      return (order.get(a.id) ?? 9999) - (order.get(b.id) ?? 9999);
    });
    return rows.map(fromRow);
  } catch {
    return FALLBACK;
  }
}

export async function getAllObjects(): Promise<XuoObject[]> {
  return load();
}

export async function getObjectById(id: string): Promise<XuoObject | undefined> {
  const all = await load();
  return all.find((o) => o.id === id);
}

export async function getObjectsByStatus(
  status: ObjectStatus | "all"
): Promise<XuoObject[]> {
  const all = await load();
  if (status === "all") return all;
  return all.filter((o) => o.status === status);
}

// Grid always sorts left-to-right: in_bidding -> available -> sold
function statusSortRank(status: ObjectStatus): number {
  switch (status) {
    case "in_bidding":
      return 0;
    case "available":
      return 1;
    case "sold":
      return 2;
    default:
      return 3;
  }
}

export function sortForGrid(objects: XuoObject[]): XuoObject[] {
  return [...objects].sort((a, b) => statusSortRank(a.status) - statusSortRank(b.status));
}

export async function getBiddingObjects(limit?: number): Promise<XuoObject[]> {
  const bidding = (await load()).filter((o) => o.status === "in_bidding");
  return limit ? bidding.slice(0, limit) : bidding;
}

export async function getRecentObjects(limit?: number): Promise<XuoObject[]> {
  const recent = (await load()).filter((o) => o.status !== "sold");
  return limit ? recent.slice(0, limit) : recent;
}
