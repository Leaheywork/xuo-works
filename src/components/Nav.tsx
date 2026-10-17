import Link from "next/link";

export default function Nav() {
  return (
    <div className="border-b border-hairline">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" aria-label="XUO.WORKS home" className="block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-photo.png"
            alt="XUO.WORKS"
            className="h-7 w-auto"
          />
        </Link>
        <nav className="flex gap-6 text-[11px] font-mono uppercase tracking-wide text-steel">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <Link href="/objects" className="hover:text-foreground">
            Objects
          </Link>
          <Link href="/#commission" className="hover:text-foreground">
            Commissions
          </Link>
        </nav>
      </div>
    </div>
  );
}
