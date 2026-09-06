import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "XUO.WORKS — extremely useless / unique objects",
  description:
    "One-off sculptural objects. Buy at the listed price, or watch the 24-hour bidding window.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700&family=JetBrains+Mono:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Nav />
        <div className="bg-[#1a1a1a] text-[#f4f3ef] text-[11px] font-mono tracking-wide text-center py-1.5 px-4">
          PROTOTYPE — static demo, no live payments or shipping.
        </div>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-hairline mt-16 py-6 px-6 flex items-center justify-between text-[11px] font-mono uppercase tracking-wide text-steel">
          <span>&copy; XUO.WORKS</span>
          <span>Prototype build — not a live store</span>
        </footer>
      </body>
    </html>
  );
}
