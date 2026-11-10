"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

const button =
  "border border-foreground px-5 py-2 text-[11px] font-mono uppercase tracking-wide hover:bg-foreground hover:text-background transition-colors disabled:opacity-40";

async function token() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? "";
}

export default function CardBox({ user }: { user: User }) {
  const [hasCard, setHasCard] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const { data } = await supabase
      .from("profiles")
      .select("has_card")
      .eq("id", user.id)
      .single();
    setHasCard(!!data?.has_card);
  }

  useEffect(() => {
    (async () => {
      const params = new URLSearchParams(window.location.search);
      const sid = params.get("session_id");
      if (sid) {
        const res = await fetch("/api/stripe/confirm-card", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await token()}`,
          },
          body: JSON.stringify({ session_id: sid }),
        });
        if (!res.ok) setError((await res.json()).error ?? "Could not confirm card.");
        window.history.replaceState({}, "", "/account");
      }
      load();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  async function addCard() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/stripe/setup-card", {
      method: "POST",
      headers: { Authorization: `Bearer ${await token()}` },
    });
    const json = await res.json();
    if (!res.ok || !json.url) {
      setError(json.error ?? "Could not start card setup.");
      setBusy(false);
      return;
    }
    window.location.href = json.url;
  }

  if (hasCard === null) return null;

  return (
    <div className="border-t border-hairline pt-4">
      <div className="text-[11px] font-mono uppercase tracking-wide text-steel mb-2">
        Card
      </div>
      {hasCard ? (
        <p className="text-sm text-steel leading-relaxed">
          Card saved. You can bid. If you win, this card is charged the
          winning bid.
        </p>
      ) : (
        <>
          <p className="text-sm text-steel leading-relaxed mb-3">
            Save a card to bid. Nothing is charged until you win.
          </p>
          <button onClick={addCard} disabled={busy} className={button}>
            {busy ? "..." : "Add a card"}
          </button>
        </>
      )}
      {error && <p className="mt-3 text-[11px] font-mono text-sold">{error}</p>}
    </div>
  );
}
