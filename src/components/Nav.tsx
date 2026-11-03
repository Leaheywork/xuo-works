import Link from "next/link";

export default function Nav() {
  return (
    <div className="border-b border-hairline">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4">
        <Link href="/" aria-label="XUO.WORKS home" className="block shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-photo.png"
            alt="XUO.WORKS"
            className="w-auto max-w-full"
            style={{ height: 52, filter: "brightness(0.35) contrast(1.5)" }}
          />
        </Link>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-mono uppercase tracking-wide text-steel">
          <Link href="/" className="hover:text-foreground">
            XUO
          </Link>
          <Link href="/objects" className="hover:text-foreground">
            Objects
          </Link>
          <Link href="/#commission" className="hover:text-foreground">
            Commissions
          </Link>
          <Link href="/account" className="hover:text-foreground">
            Account
          </Link>
          <a
            href="https://leahey.work"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            Who makes this&hellip;
          </a>
        </nav>
      </div>
    </div>
  );
}
