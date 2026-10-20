"use client";

import { useState } from "react";

import { FORMSPREE_ID, STUDIO_EMAIL as FALLBACK_EMAIL } from "@/lib/forms";

export default function ContactForm() {
  const connected = FORMSPREE_ID !== "";
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  // Until the form is connected, the live site keeps a plain email link.
  if (!connected && process.env.NODE_ENV === "production") {
    return (
      <a
        href={`mailto:${FALLBACK_EMAIL}?subject=XUO.WORKS%20commission%20enquiry`}
        className="inline-block border border-foreground px-4 py-1.5 text-[11px] font-mono uppercase tracking-wide hover:bg-foreground hover:text-background transition-colors"
      >
        Contact the studio
      </a>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!connected) return;
    setState("sending");
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
      });
      if (res.ok) {
        setState("sent");
        form.reset();
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <p className="text-sm text-foreground">
        Sent. We&apos;ll be in touch.
      </p>
    );
  }

  const field =
    "w-full border border-hairline px-3 py-2 text-sm bg-background";

  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-3">
      <input
        type="text"
        name="name"
        required
        placeholder="Your name"
        className={field}
      />
      <input
        type="email"
        name="email"
        required
        placeholder="Your email"
        className={field}
      />
      <textarea
        name="message"
        required
        rows={4}
        placeholder="What do you have in mind?"
        className={field}
      />
      {/* Spam trap: real people never fill this in */}
      <input
        type="text"
        name="_gotcha"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
      />
      <input type="hidden" name="_subject" value="XUO.WORKS commission enquiry" />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={!connected || state === "sending"}
          className="border border-foreground px-5 py-2 text-[11px] font-mono uppercase tracking-wide hover:bg-foreground hover:text-background transition-colors disabled:opacity-40"
        >
          {state === "sending" ? "Sending..." : "Send"}
        </button>
        {state === "error" && (
          <span className="text-[11px] font-mono text-sold">
            Didn&apos;t send. Try again, or email {FALLBACK_EMAIL}.
          </span>
        )}
        {!connected && (
          <span className="text-[11px] font-mono text-steel">
            Preview only — not connected yet.
          </span>
        )}
      </div>
    </form>
  );
}
