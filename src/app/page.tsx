import Link from "next/link";
import Tile from "@/components/Tile";
import { getBiddingObjects, getRecentObjects } from "@/lib/data";

export default function Home() {
  const bidding = getBiddingObjects(7);
  const recent = getRecentObjects(7);
  const hero = recent[0];

  return (
    <div>
      {hero && (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={hero.images[0]}
            alt={hero.title}
            className="w-full h-[52vh] min-h-[320px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent flex items-end">
            <div className="max-w-6xl mx-auto w-full px-6 pb-10 text-white">
              <h1 className="text-3xl md:text-4xl font-semibold uppercase tracking-tight leading-tight">
                Steel objects,
                <br />
                one at a time
              </h1>
              <p className="mt-3 max-w-md text-sm text-white/85">
                Each piece is unique. Buy at the listed price, or watch the
                24-hour bidding window and place a higher offer.
              </p>
              <Link
                href="/objects"
                className="inline-block mt-5 border border-white/70 px-5 py-2 text-[11px] font-mono uppercase tracking-wide hover:bg-white hover:text-[#1a1a1a] transition-colors"
              >
                View objects
              </Link>
            </div>
          </div>
        </div>
      )}

      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-baseline justify-between border-b border-hairline pb-3 mb-5">
          <h2 className="uppercase tracking-wide text-sm font-semibold">
            Currently in bidding
          </h2>
          <Link
            href="/objects?filter=in_bidding"
            className="text-[11px] font-mono uppercase tracking-wide text-steel hover:text-foreground"
          >
            See all &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-px bg-hairline border border-hairline">
          {(bidding.length ? bidding : recent).map((o) => (
            <div key={o.id} className="bg-background">
              <Tile object={o} />
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-12">
        <div className="flex items-baseline justify-between border-b border-hairline pb-3 mb-5">
          <h2 className="uppercase tracking-wide text-sm font-semibold">
            Recently added
          </h2>
          <Link
            href="/objects"
            className="text-[11px] font-mono uppercase tracking-wide text-steel hover:text-foreground"
          >
            See all &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-px bg-hairline border border-hairline">
          {recent.map((o) => (
            <div key={o.id} className="bg-background">
              <Tile object={o} />
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-16 border-t border-hairline pt-10">
        <h2 className="uppercase tracking-wide text-sm font-semibold mb-3">
          About
        </h2>
        <p className="max-w-2xl text-sm text-steel leading-relaxed">
          Workshop-based sculpture built from steel, found hardware, and
          reclaimed materials. Each object listed here is a one-off — once
          it&apos;s sold, it&apos;s gone. Domestic and international shipping
          quoted live at checkout.
        </p>
      </section>
    </div>
  );
}
