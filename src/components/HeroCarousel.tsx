"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

export default function HeroCarousel({
  objects,
  headline,
  blurb,
}: {
  objects: XuoObject[];
  headline: string;
  blurb: string;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || objects.length < 2) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % objects.length);
    }, 4500);
    return () => clearInterval(t);
  }, [paused, objects.length]);

  if (!objects.length) return null;
  const current = objects[index];
  const isBidding = current.status === "in_bidding";

  return (
    <div className="border-b border-hairline">
      <div className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold uppercase tracking-tight leading-tight whitespace-pre-line">
            {headline}
          </h1>
          <p className="mt-3 max-w-md text-sm text-steel">{blurb}</p>
          <Link
            href="/objects"
            className="inline-block mt-5 border border-foreground px-5 py-2 text-[11px] font-mono uppercase tracking-wide hover:bg-foreground hover:text-background transition-colors"
          >
            View objects
          </Link>
        </div>

        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <Link
            href={`/objects/${current.id}`}
            className="block border border-hairline bg-white"
          >
            <div className="relative aspect-square">
              {objects.map((o, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={o.id}
                  src={o.images[0]}
                  alt={o.title}
                  className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-700 ${
                    i === index ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
            </div>
          </Link>
          <div className="flex items-center justify-between mt-3 text-[12px]">
            <span className="uppercase tracking-wide">{current.title}</span>
            <span className="font-mono text-steel">
              {isBidding && current.hoursLeft !== undefined
                ? formatCountdown(current.hoursLeft)
                : formatPrice(current.currentBid ?? current.price)}
            </span>
          </div>
          <div
            className={`text-[10px] font-mono uppercase tracking-wide mt-0.5 ${
              isBidding ? "text-bidding" : "text-available"
            }`}
          >
            {isBidding ? "In bidding" : "Available"}
          </div>
          <div className="flex gap-2 mt-4">
            {objects.map((o, i) => (
              <button
                key={o.id}
                type="button"
                aria-label={`Show ${o.title}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 w-6 transition-colors ${
                  i === index ? "bg-foreground" : "bg-hairline"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
