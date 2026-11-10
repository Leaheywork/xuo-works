"use client";

import { CURRENCIES, formatAud, useCurrency } from "@/lib/currency";

// Shows an AUD price in the visitor's chosen currency (approximate).
export default function Price({ aud }: { aud: number }) {
  const { code, rates } = useCurrency();
  if (code === "AUD") return <>{formatAud(aud)}</>;
  const c = CURRENCIES[code];
  const value = Math.round(aud * (rates[code] ?? c.fallback));
  return (
    <>
      ≈ {c.symbol}
      {value.toLocaleString("en-US")}
    </>
  );
}
