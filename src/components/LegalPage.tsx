import Link from "next/link";

export default function LegalPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="uppercase tracking-wide text-sm font-semibold border-b border-hairline pb-3 mb-6">
        {title}
      </h1>
      <div className="space-y-4 text-sm leading-relaxed">{children}</div>
      <nav className="mt-10 pt-4 border-t border-hairline flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-mono uppercase tracking-wide text-steel">
        <Link href="/terms" className="hover:text-foreground">
          Terms
        </Link>
        <Link href="/shipping" className="hover:text-foreground">
          Shipping
        </Link>
        <Link href="/returns" className="hover:text-foreground">
          Returns
        </Link>
      </nav>
    </section>
  );
}

export function H({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11px] font-mono uppercase tracking-wide text-steel pt-4">
      {children}
    </h2>
  );
}
