"use client";

import { useState } from "react";
import type { XuoObject } from "@/lib/types";

function formatPrice(n: number) {
  return `$${n.toLocaleString("en-AU")}`;
}

export default function BuyBox({ object }: { object: XuoObject }) {
  const [bidding, setBidding] = useState(object.status === "in_bidding");
  const [currentBid, setCurrentBid] = useState(object.currentBid ?? object.price);
  const [bidCount, setBidCount] = useState(object.bidCount ?? 0);
  const [bidInput, setBidInput] = useState("");
  const [offerInput, setOfferInput] = useState("");

  const offerBox = (
    <div className="mt-5 pt-4 border-t border-hairline">
      <div className="text-[11px] font-mono uppercase tracking-wide text-steel mb-2">
        Or make an offer
      </div>
      <div className="flex gap-2">
        <input
          type="number"
          min={1}
          placeholder="Your offer (AUD)"
          value={offerInput}
          onChange={(e) => setOfferInput(e.target.value)}
          className="flex-1 border border-hairline px-3 py-2 text-sm font-mono bg-background"
        />
        <a
          href={
            Number(offerInput) > (bidding ? currentBid : object.price)
              ? `mailto:work@xuo.works?subject=${encodeURIComponent(
                  `Offer for ${object.title}`
                )}&body=${encodeURIComponent(
                  `I'd like to offer $${Number(offerInput).toLocaleString(
                    "en-AU"
                  )} for ${object.title}.`
                )}`
              : undefined
          }
          className="border border-foreground px-4 py-2 text-[11px] font-mono uppercase tracking-wide hover:bg-foreground hover:text-background transition-colors"
        >
          Make offer
        </a>
      </div>
      <p className="text-[11px] text-steel mt-2 leading-relaxed">
        Only offers above the {bidding ? "current bid" : "listed price"} (
        {formatPrice(bidding ? currentBid : object.price)}) will be
        considered.
      </p>
    </div>
  );

  if (object.status === "sold") {
    return (
      <div className="border border-hairline p-5">
        <div className="flex items-center gap-2 text-sold text-[11px] font-mono uppercase tracking-wide mb-2">
          <span className="h-1.5 w-1.5 rounded-full bg-sold inline-block" />
          Not available
        </div>
        <p className="text-sm text-steel">
          This piece is no longer available.
        </p>
      </div>
    );
  }

  if (!bidding) {
    return (
      <div className="border border-hairline p-5">
        <div className="text-2xl font-mono mb-4">{formatPrice(object.price)}</div>
        <button
          onClick={() => {
            setBidding(true);
            setCurrentBid(object.price);
            setBidCount(1);
          }}
          className="w-full border border-foreground py-2.5 text-[11px] font-mono uppercase tracking-wide hover:bg-foreground hover:text-background transition-colors"
        >
          Buy now
        </button>
        <p className="text-[11px] text-steel mt-3 leading-relaxed">
          24 hours on the clock. Highest bid wins. We&apos;ll tell you if
          you&apos;re outbid.
        </p>
        {offerBox}
      </div>
    );
  }

  const minNext = currentBid + 10;

  return (
    <div className="border border-hairline p-5">
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-[11px] font-mono uppercase tracking-wide text-steel">
          Current bid
        </span>
        <span className="text-[11px] font-mono text-steel">23:59:59</span>
      </div>
      <div className="text-2xl font-mono mb-1">{formatPrice(currentBid)}</div>
      <div className="text-[11px] font-mono text-steel mb-4">
        {bidCount} bid{bidCount === 1 ? "" : "s"}
      </div>
      <div className="flex gap-2">
        <input
          type="number"
          min={minNext}
          placeholder={String(minNext)}
          value={bidInput}
          onChange={(e) => setBidInput(e.target.value)}
          className="flex-1 border border-hairline px-3 py-2 text-sm font-mono bg-background"
        />
        <button
          onClick={() => {
            const val = Number(bidInput);
            if (!val || val < minNext) return;
            setCurrentBid(val);
            setBidCount((c) => c + 1);
            setBidInput("");
          }}
          className="border border-foreground px-4 text-[11px] font-mono uppercase tracking-wide hover:bg-foreground hover:text-background transition-colors"
        >
          Place bid
        </button>
      </div>
      <p className="text-[11px] text-steel mt-3">
        Minimum next bid: {formatPrice(minNext)}
      </p>
      {offerBox}
    </div>
  );
}
