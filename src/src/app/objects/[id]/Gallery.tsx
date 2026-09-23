"use client";

import { useState } from "react";

export default function Gallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  return (
    <div>
      <div
        className="aspect-square border border-hairline overflow-hidden bg-white cursor-zoom-in relative group"
        onClick={() => setZoomed(true)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[active]}
          alt={title}
          className="h-full w-full object-cover"
        />
        <span className="absolute bottom-2 right-2 bg-foreground text-background text-[10px] font-mono uppercase tracking-wide px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
          Click to zoom
        </span>
      </div>
      {zoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center cursor-zoom-out p-6"
          onClick={() => setZoomed(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[active]}
            alt={title}
            className="max-h-full max-w-full object-contain"
          />
          <button
            onClick={() => setZoomed(false)}
            aria-label="Close"
            className="absolute top-4 right-4 text-background text-2xl leading-none border border-background/40 w-9 h-9 flex items-center justify-center hover:bg-background/10"
          >
            &times;
          </button>
        </div>
      )}
      {images.length > 1 && (
        <div className="flex gap-2 mt-2">
          {images.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setActive(i)}
              className={`h-16 w-16 border overflow-hidden ${
                i === active ? "border-foreground" : "border-hairline"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
