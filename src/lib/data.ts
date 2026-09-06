import raw from "@/data/objects.json";
import type { ObjectStatus, XuoObject } from "./types";

const OBJECTS = raw as XuoObject[];

export function getAllObjects(): XuoObject[] {
  return OBJECTS;
}

export function getObjectById(id: string): XuoObject | undefined {
  return OBJECTS.find((o) => o.id === id);
}

export function getObjectsByStatus(status: ObjectStatus | "all"): XuoObject[] {
  if (status === "all") return OBJECTS;
  return OBJECTS.filter((o) => o.status === status);
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

export function getBiddingObjects(limit?: number): XuoObject[] {
  const bidding = OBJECTS.filter((o) => o.status === "in_bidding");
  return limit ? bidding.slice(0, limit) : bidding;
}

export function getRecentObjects(limit?: number): XuoObject[] {
  const recent = OBJECTS.filter((o) => o.status !== "sold");
  return limit ? recent.slice(0, limit) : recent;
}
