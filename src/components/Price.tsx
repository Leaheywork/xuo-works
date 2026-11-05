"use client";

import { CURRENCIES, formatUsd, useCurrency } from "@/lib/currency";

// Shows a USD price in the visitor's chosen currency (approximate).
export default function Price({ usd }: { usd: number }) {
  const { code, rates } = useCurrency();
  if (code === "USD") return <>{formatUsd(usd)}</>;
  const c = CURRENCIES[code];
  const value = Math.round(usd * (rates[code] ?? c.fallback));
  return (
    <>
      ≈ {c.symbol}
      {value.toLocaleString("en-US")}
    </>
  );
}
