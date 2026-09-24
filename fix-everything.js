#!/usr/bin/env node
/*
  One-off repair script.
  Run this once from inside your xuo-works project folder:
      node fix-everything.js
  Then run:
      git add .
      git commit -m "restore accidentally deleted files, fix colors properly"
      git push
  After that works, you can delete this file.
*/

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const RESTORE_FROM = "1f911fa"; // last known-good commit before the accidental deletions

const filesToRestore = [
  "src/app/layout.tsx",
  "src/app/favicon.ico",
  "src/app/page.tsx",
  "src/app/objects/page.tsx",
  "src/app/objects/ObjectsGrid.tsx",
  "src/app/objects/[id]/page.tsx",
  "src/app/objects/[id]/BuyBox.tsx",
  "src/app/objects/[id]/Gallery.tsx",
  "src/components/Nav.tsx",
];

console.log("Restoring accidentally deleted files from commit " + RESTORE_FROM + "...");
for (const f of filesToRestore) {
  try {
    execSync(`git checkout ${RESTORE_FROM} -- "${f}"`, { stdio: "inherit", cwd: __dirname });
    console.log("  restored:", f);
  } catch (e) {
    console.error("  FAILED to restore:", f, e.message);
  }
}

console.log("\nRemoving accidentally duplicated folders...");
for (const bad of ["src/app/app", "src/components/components"]) {
  const full = path.join(__dirname, bad);
  if (fs.existsSync(full)) {
    fs.rmSync(full, { recursive: true, force: true });
    console.log("  removed:", bad);
  }
}

const GLOBALS_CSS = `@import "tailwindcss";

:root {
  --background: #f4f3ef;
  --foreground: #1a1a1a;
  --steel: #6e7378;
  --hairline: #c9c7c0;
  --sold: #b23b23;
  --available: #5b7a5e;
  --bidding: #a9822c;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-steel: var(--steel);
  --color-hairline: var(--hairline);
  --color-sold: var(--sold);
  --color-available: var(--available);
  --color-bidding: var(--bidding);
  --font-sans: "Archivo", "Arial Narrow", Arial, Helvetica, sans-serif;
  --font-mono: "JetBrains Mono", "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans);
}

.hairline {
  border-color: var(--hairline);
}
`;

const TILE_TSX = `import Link from "next/link";
import type { XuoObject } from "@/lib/types";

function formatPrice(n: number) {
  return \`$\${n.toLocaleString("en-AU")}\`;
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
      href={\`/objects/\${object.id}\`}
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
            className={\`text-[10px] font-mono uppercase tracking-wide mt-0.5 \${
              isSold ? "text-sold" : isBidding ? "text-bidding" : "text-available"
            }\`}
          >
            {isSold ? "Not available" : isBidding ? "In bidding" : "Available"}
          </div>
        </div>
      )}
    </Link>
  );
}
`;

console.log("\nWriting correct globals.css...");
fs.writeFileSync(path.join(__dirname, "src", "app", "globals.css"), GLOBALS_CSS);

console.log("Writing correct Tile.tsx...");
fs.writeFileSync(path.join(__dirname, "src", "components", "Tile.tsx"), TILE_TSX);

console.log("\nAll done. Now run:\n  git add .\n  git status\n  git commit -m \"restore accidentally deleted files, fix colors properly\"\n  git push\n");
