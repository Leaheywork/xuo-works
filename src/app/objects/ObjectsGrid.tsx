"use client";

import { useMemo, useState } from "react";
import Tile from "@/components/Tile";
import { sortForGrid } from "@/lib/data";
import type { ObjectStatus, XuoObject } from "@/lib/types";

const FILTERS: { key: ObjectStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "available", label: "Available" },
  { key: "in_bidding", label: "In bidding" },
  { key: "sold", label: "Sold" },
];

export default function ObjectsGrid({ objects }: { objects: XuoObject[] }) {
  const [active, setActive] = useState<ObjectStatus | "all">("all");

  const filtered = useMemo(() => {
    const list = active === "all" ? objects : objects.filter((o) => o.status === active);
    return sortForGrid(list);
  }, [objects, active]);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setActive(f.key)}
              className={`text-[11px] font-mono uppercase tracking-wide px-3 py-1.5 border ${
                active === f.key
                  ? "border-foreground bg-foreground text-background"
                  : "border-hairline text-steel hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span className="text-[11px] font-mono text-steel">
          {filtered.length} object{filtered.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-px bg-hairline border border-hairline">
        {filtered.map((o) => (
          <div key={o.id} className="bg-background">
            <Tile object={o} />
          </div>
        ))}
      </div>
    </div>
  );
}
