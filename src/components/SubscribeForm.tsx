"use client";

import { useState } from "react";

// Sign-up box for "tell me when new pieces drop".
// Sign-ups go to a Buttondown newsletter account.
// After creating the Buttondown account, put its username here.
const BUTTONDOWN_USERNAME: string = "xuoworks";

export default function SubscribeForm() {
  const connected = BUTTONDOWN_USERNAME !== "";
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">(
    "idle"
  );

  // Don't show a dead form on the live site until the account is connected.
  if (!connected && process.env.NODE_ENV === "production") return null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!connected) return;
    setState("sending");
    const form = e.currentTarget;
    const body = new URLSearchParams();
    body.set("email", new FormData(form).get("email") as string);
    body.set("embed", "1");
    try {
      // no-cors: Buttondown doesn't send back a readable reply, but the
      // sign-up still goes through.
      await fetch(
        `https://buttondown.com/api/emails/embed-subscribe/${BUTTONDOWN_USERNAME}`,
        {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: body.toString(),
        }
      );
      setState("done");
      form.reset();
    } catch {
      setState("error");
    }
  }

  return (
    <section className="max-w-6xl mx-auto px-6 py-12 border-t border-hairline">
      <h2 className="uppercase tracking-wide text-sm font-semibold mb-3">
        Made once. Once gone - gone.
      </h2>
      <p className="text-sm text-steel leading-relaxed mb-4">
        Contact me when other useless / unique objects are created.
      </p>
      {state === "done" ? (
        <p className="text-sm text-foreground">Done.</p>
      ) : (
        <form
          onSubmit={onSubmit}
          className="flex flex-col sm:flex-row gap-2 max-w-md"
        >
          <input
            type="email"
            name="email"
            required
            placeholder="Your email"
            className="flex-1 border border-hairline px-3 py-2 text-sm bg-background"
          />
          <button
            type="submit"
            disabled={!connected || state === "sending"}
            className="border border-foreground px-5 py-2 text-[11px] font-mono uppercase tracking-wide hover:bg-foreground hover:text-background transition-colors disabled:opacity-40"
          >
            {state === "sending" ? "Sending..." : "Contact me"}
          </button>
        </form>
      )}
      {state === "error" && (
        <p className="mt-2 text-[11px] font-mono text-sold">
          Didn&apos;t go through. Try again.
        </p>
      )}
      {!connected && (
        <p className="mt-2 text-[11px] font-mono text-steel">
          Preview only — not connected to an email list yet.
        </p>
      )}
    </section>
  );
}
