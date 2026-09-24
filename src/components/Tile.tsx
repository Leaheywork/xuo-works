import Link from "next/link";
import type { XuoObject } from "@/lib/types";

function formatPrice(n: number) {
  return `$${n.toLocaleString("en-AU")}`;
}

function formatCountdown(hoursLeft: number) {
  const totalSeconds = Math.max(0, Math.round(hoursLeft * 3600));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

export default function Tile({ object, showName = true }: { object: XuoObject; showName?: boolean }) {
  const isSold = object.status === "sold";
  const isBidding = object.status === "in_bidding";

  return (
    <Link
      href={`/objects/${object.id}`}
      className="group block border border-hairline"
    >
      <div className="relative aspect-square overflow-hidden bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={object.images[0]}
          alt={object.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
        {isSold && (
          <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-sold" />
        )}
      </div>
      {showName && (
        <div className="px-2 py-2">
          <div className="flex items-center justify-between text-[12px]">
            <span className="uppercase tracking-wide flex items-center gap-1.5">
              {object.title}
              {isSold && <span className="h-1.5 w-1.5 rounded-full bg-sold inline-block" />}
            </span>
            <span className="font-mono text-steel">
              {isBidding && object.hoursLeft !== undefined
                ? formatCountdown(object.hoursLeft)
                : formatPrice(object.currentBid ?? object.price)}
            </span>
          </div>
          <div
            className={`text-[10px] font-mono uppercase tracking-wide mt-0.5 ${
              isSold ? "text-sold" : "text-steel"
            }`}
          >
            {isSold ? "Not available" : isBidding ? "In bidding" : "Available"}
          </div>
        </div>
      )}
    </Link>
  );
}
