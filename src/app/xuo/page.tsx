import Link from "next/link";

export const metadata = { title: "XUO — XUO.WORKS" };

export default function XuoPage() {
  return (
    <section className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="uppercase tracking-wide text-sm font-semibold border-b border-hairline pb-3 mb-6">
        XUO
      </h1>
      <div className="space-y-4 text-sm leading-relaxed">
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
          Every piece is made by hand, once. We ship worldwide, and shipping is
          confirmed before your piece goes out.
        </p>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/#objects"
          className="border border-foreground px-4 py-1.5 text-[11px] font-mono uppercase tracking-wide hover:bg-foreground hover:text-background transition-colors"
        >
          See the objects &rarr;
        </Link>
        <a
          href="https://leahey.work"
          target="_blank"
          rel="noopener noreferrer"
          className="border border-hairline px-4 py-1.5 text-[11px] font-mono uppercase tracking-wide text-steel hover:text-foreground transition-colors"
        >
          Who makes this&hellip; &rarr;
        </a>
      </div>
    </section>
  );
}
