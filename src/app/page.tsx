import Link from "next/link";
import Tile from "@/components/Tile";
import HeroCarousel from "@/components/HeroCarousel";
import { getAllObjects, getBiddingObjects, getRecentObjects } from "@/lib/data";

export default function Home() {
  const bidding = getBiddingObjects(7);
  const recent = getRecentObjects(7);
  const featured = getAllObjects()
    .filter((o) => o.status === "available" || o.status === "in_bidding")
    .reverse()
    .slice(0, 8);

  return (
    <div>
      <HeroCarousel
        objects={featured}
        headline={"Made by hand.\nMade once."}
        blurb="Each piece is unique and ships worldwide. Buy at the listed price, or watch the 24-hour bidding window and place a higher offer."
      />

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

      <section
        id="commission"
        className="max-w-6xl mx-auto px-6 py-12 border-t border-hairline"
      >
        <h2 className="uppercase tracking-wide text-sm font-semibold mb-3">
          Commissions
        </h2>
        <p className="text-sm text-steel leading-relaxed">
          Need something useless or unique made? The studio fabricates
          one-off objects to order.
          <a
            href="mailto:work@xuo.works?subject=XUO.WORKS%20commission%20enquiry"
            className="inline-block ml-3 align-middle border border-foreground px-4 py-1.5 text-[11px] font-mono uppercase tracking-wide text-foreground hover:bg-foreground hover:text-background transition-colors"
          >
            Contact the studio
          </a>
        </p>
        <p className="mt-3 text-[11px] font-mono text-steel">
          work@xuo.works
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-16 border-t border-hairline pt-10">
        <h2 className="uppercase tracking-wide text-sm font-semibold mb-3">
          About
        </h2>
        <p className="max-w-2xl text-sm text-steel leading-relaxed">
          Workshop-based sculpture made from metal, found objects, and
          whatever else the work calls for. Each object listed here is a
          one-off — once it&apos;s sold, it&apos;s gone. We ship worldwide — international is
          no problem, and shipping is quoted live at checkout.
        </p>
        <a
          href="https://leahey.work"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-5 border border-foreground px-4 py-1.5 text-[11px] font-mono uppercase tracking-wide hover:bg-foreground hover:text-background transition-colors"
        >
          Who made this&hellip; &rarr;
        </a>
      </section>
    </div>
  );
}
