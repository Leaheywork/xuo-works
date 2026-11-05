"use client";

import { CURRENCIES, setCurrency, useCurrency } from "@/lib/currency";

export default function CurrencyPicker() {
  const { code } = useCurrency();
  return (
    <select
      value={code}
      onChange={(e) => setCurrency(e.target.value)}
      aria-label="Currency"
      title="Prices are in USD. Other currencies are approximate."
      className="bg-transparent text-[11px] font-mono uppercase tracking-wide text-steel border border-hairline px-1.5 py-0.5 hover:text-foreground"
    >
      {Object.keys(CURRENCIES).map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
  );
}
