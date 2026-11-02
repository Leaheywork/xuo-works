"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// Sign-up box for "tell me when new pieces drop".
// Sign-ups go to a Buttondown newsletter account.
const BUTTONDOWN_USERNAME: string = "xuoworks";
const FLAG = "xuo-subscribed";

// variant "section": the full block on the home page.
// variant "band": a dark strip shown on every other page until the visitor signs up.
export default function SubscribeForm({
  variant = "section",
}: {
  variant?: "section" | "band";
}) {
  const connected = BUTTONDOWN_USERNAME !== "";
  const pathname = usePathname();
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">(
    "idle"
  );
  const [already, setAlready] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(FLAG)) setAlready(true);
    } catch {}
  }, []);

  // Don't show a dead form on the live site until the account is connected.
  if (!connected && process.env.NODE_ENV === "production") return null;

  const band = variant === "band";
  // The band is for inner pages only, and goes away once someone has signed up.
  if (band && (pathname === "/" || already)) return null;

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
      try {
        localStorage.setItem(FLAG, "1");
      } catch {}
    } catch {
      setState("error");
    }
  }

  const inputCls = band
    ? "flex-1 border border-[#f4f3ef]/60 bg-transparent text-[#f4f3ef] placeholder:text-[#f4f3ef]/60 px-3 py-2 text-sm"
    : "flex-1 border border-hairline px-3 py-2 text-sm bg-background";
  const btnCls = band
    ? "border border-[#f4f3ef] bg-[#f4f3ef] text-[#1a1a1a] px-5 py-2 text-[11px] font-mono uppercase tracking-wide hover:bg-transparent hover:text-[#f4f3ef] transition-colors disabled:opacity-40"
    : "border border-foreground px-5 py-2 text-[11px] font-mono uppercase tracking-wide hover:bg-foreground hover:text-background transition-colors disabled:opacity-40";

  const content = (
    <>
      <div className={band ? "md:flex-1" : ""}>
        <h2
          className={
            band
              ? "uppercase tracking-wide text-sm font-semibold mb-1"
              : "uppercase tracking-wide text-sm font-semibold mb-3"
          }
        >
          Made once. Once gone - gone.
        </h2>
        <p
          className={
            band
              ? "text-sm opacity-80 leading-relaxed"
              : "text-sm text-steel leading-relaxed mb-4"
          }
        >
          Contact me when other useless / unique objects are created.
        </p>
      </div>
      <div className={band ? "md:flex-1 md:max-w-md" : ""}>
        {state === "done" ? (
          <p className="text-sm">Done.</p>
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
              className={inputCls}
            />
            <button
              type="submit"
              disabled={!connected || state === "sending"}
              className={btnCls}
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
          <p className="mt-2 text-[11px] font-mono opacity-70">
            Preview only — not connected to an email list yet.
          </p>
        )}
      </div>
    </>
  );

  if (band) {
    return (
      <div className="bg-[#1a1a1a] text-[#f4f3ef] mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row md:items-center gap-4 md:gap-10">
          {content}
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-6 py-12 border-t border-hairline">
      {content}
    </section>
  );
}
