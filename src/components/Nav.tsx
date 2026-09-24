import Link from "next/link";

export default function Nav() {
  return (
    <div className="border-b border-hairline">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-semibold uppercase tracking-[0.08em] text-sm"
        >
          XUO<span className="text-sold">.</span>WORKS
        </Link>
        <nav className="flex gap-6 text-[11px] font-mono uppercase tracking-wide text-steel">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <Link href="/objects" className="hover:text-foreground">
            Objects
          </Link>
        </nav>
      </div>
    </div>
  );
}
