import Link from "next/link";
import Tile from "@/components/Tile";
import HeroCarousel from "@/components/HeroCarousel";
import SubscribeForm from "@/components/SubscribeForm";
import ContactForm from "@/components/ContactForm";
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

      <SubscribeForm />

      <section className="max-w-6xl mx-auto px-6 py-12 border-t border-hairline">
        <h2 className="uppercase tracking-wide text-sm font-semibold mb-3">
          About
        </h2>
        <div className="max-w-2xl space-y-3 text-sm text-steel leading-relaxed">
          <p>
            OEO. Original exclusive objects. Los Angeles, 1987. Made as wrap
            gifts for the people behind the films. One object per film,
            representing its essence. Never repeated.
          </p>
          <p>
            Forty years later: XUO. Extremely useless / unique objects. Same
            rule.
          </p>
          <p>
            We ship worldwide. International is no problem, and shipping is
            quoted live at checkout.
          </p>
        </div>
        <a
          href="https://leahey.work"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-5 border border-foreground px-4 py-1.5 text-[11px] font-mono uppercase tracking-wide hover:bg-foreground hover:text-background transition-colors"
        >
          Who made this&hellip; &rarr;
        </a>
      </section>

      <section
        id="commission"
        className="max-w-6xl mx-auto px-6 pb-16 pt-12 border-t border-hairline"
      >
        <h2 className="uppercase tracking-wide text-sm font-semibold mb-3">
          Commissions
        </h2>
        <p className="text-sm text-steel leading-relaxed mb-5">
          Need something useless / unique made? The studio fabricates
          one-off objects to order.
        </p>
        <ContactForm />
      </section>
    </div>
  );
}
