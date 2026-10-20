"use client";

import { useState } from "react";
import { FORMSPREE_ID, STUDIO_EMAIL } from "@/lib/forms";

function formatPrice(n: number) {
  return `$${n.toLocaleString("en-AU")}`;
}

export default function OfferForm({
  title,
  id,
  floor,
  floorLabel,
}: {
  title: string;
  id: string;
  floor: number;
  floorLabel: string;
}) {
  const connected = FORMSPREE_ID !== "";
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [amount, setAmount] = useState("");
  const valid = Number(amount) > floor;

  const heading = (
    <div className="text-[11px] font-mono uppercase tracking-wide text-steel mb-2">
      Or make an offer
    </div>
  );
  const note = (
    <p className="text-[11px] text-steel mt-2 leading-relaxed">
      Only offers above the {floorLabel} ({formatPrice(floor)}) will be
      considered.
    </p>
  );

  // Until the form is connected, the live site keeps the email-link version.
  if (!connected && process.env.NODE_ENV === "production") {
    return (
      <div className="mt-5 pt-4 border-t border-hairline">
        {heading}
        <div className="flex gap-2">
          <input
            type="number"
            min={1}
            placeholder="Your offer (AUD)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 border border-hairline px-3 py-2 text-sm font-mono bg-background"
          />
          <a
            href={
              valid
                ? `mailto:${STUDIO_EMAIL}?subject=${encodeURIComponent(
                    `Offer for ${title}`
                  )}&body=${encodeURIComponent(
                    `I'd like to offer $${Number(amount).toLocaleString(
                      "en-AU"
                    )} for ${title}.`
                  )}`
                : undefined
            }
            className="border border-foreground px-4 py-2 text-[11px] font-mono uppercase tracking-wide hover:bg-foreground hover:text-background transition-colors"
          >
            Make offer
          </a>
        </div>
        {note}
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!connected || !valid) return;
    setState("sending");
    const form = e.currentTarget;
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });
      if (res.ok) {
        setState("sent");
        form.reset();
        setAmount("");
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div className="mt-5 pt-4 border-t border-hairline">
        {heading}
        <p className="text-sm">Offer sent. We&apos;ll be in touch.</p>
      </div>
    );
  }

  const field =
    "w-full border border-hairline px-3 py-2 text-sm bg-background";

  return (
    <div className="mt-5 pt-4 border-t border-hairline">
      {heading}
      <form onSubmit={onSubmit} className="space-y-2">
        <input type="hidden" name="_subject" value={`Offer for ${title}`} />
        <input type="hidden" name="piece" value={`${title} (${id})`} />
        <input type="text" name="name" required placeholder="Your name" className={field} />
        <input type="email" name="email" required placeholder="Your email" className={field} />
        <input
          type="number"
          name="offer_aud"
          min={floor + 1}
          required
          placeholder="Your offer (AUD)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={`${field} font-mono`}
        />
        <input
          type="text"
          name="_gotcha"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
        />
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={!connected || !valid || state === "sending"}
            className="border border-foreground px-5 py-2 text-[11px] font-mono uppercase tracking-wide hover:bg-foreground hover:text-background transition-colors disabled:opacity-40"
          >
            {state === "sending" ? "Sending..." : "Make offer"}
          </button>
          {state === "error" && (
            <span className="text-[11px] font-mono text-sold">
              Didn&apos;t send. Try again, or email {STUDIO_EMAIL}.
            </span>
          )}
          {!connected && (
            <span className="text-[11px] font-mono text-steel">
              Preview only — not connected yet.
            </span>
          )}
        </div>
      </form>
      {note}
    </div>
  );
}
