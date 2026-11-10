"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { XuoObject } from "@/lib/types";
import OfferForm from "@/components/OfferForm";
import Price from "@/components/Price";
import { minNextBid, ANTI_SNIPE_MINUTES } from "@/lib/bidding";
import { useCurrency, formatAud } from "@/lib/currency";
import { supabase, supabaseConfigured } from "@/lib/supabase";

function AudNote({ aud }: { aud: number }) {
  const { code } = useCurrency();
  if (code === "AUD") return null;
  return (
    <div className="text-[11px] font-mono text-steel mb-3">
      Priced and charged in AUD: {formatAud(aud)}
    </div>
  );
}

function countdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

interface BidRow {
  status: "available" | "in_bidding" | "sold";
  current_bid: number | string | null;
  bid_count: number | null;
  ends_at: string | null;
}

const bigButton =
  "w-full border border-foreground py-2.5 text-[11px] font-mono uppercase tracking-wide hover:bg-foreground hover:text-background transition-colors disabled:opacity-40";

export default function BuyBox({ object }: { object: XuoObject }) {
  const [status, setStatus] = useState(object.status);
  const [currentBid, setCurrentBid] = useState(object.currentBid ?? object.price);
  const [bidCount, setBidCount] = useState(object.bidCount ?? 0);
  const [endsAt, setEndsAt] = useState<string | undefined>(object.endsAt);
  const [bidInput, setBidInput] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [leading, setLeading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!supabaseConfigured) return;
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) =>
      setSignedIn(!!s)
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  // The page may be up to a minute old, so fetch the live state on load.
  useEffect(() => {
    if (!supabaseConfigured) return;
    supabase
      .from("objects")
      .select("status,current_bid,bid_count,ends_at")
      .eq("id", object.id)
      .single()
      .then(({ data }) => {
        if (!data) return;
        const row = data as BidRow;
        setStatus(row.status);
        if (row.current_bid != null) setCurrentBid(Number(row.current_bid));
        setBidCount(row.bid_count ?? 0);
        setEndsAt(row.ends_at ?? undefined);
      });
  }, [object.id]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const bidding = status === "in_bidding";
  const msLeft = endsAt ? new Date(endsAt).getTime() - now : 0;
  const closed = bidding && msLeft <= 0;

  async function bid(amount: number) {
    setError("");
    setBusy(true);
    const { data, error: e } = await supabase.rpc("place_bid", {
      p_object: object.id,
      p_amount: amount,
    });
    setBusy(false);
    if (e) {
      setError(e.message);
      return;
    }
    const row = data as BidRow;
    setStatus(row.status);
    setCurrentBid(Number(row.current_bid));
    setBidCount(row.bid_count ?? 0);
    setEndsAt(row.ends_at ?? undefined);
    setLeading(true);
    setBidInput("");
  }

  const offerBox = (
    <OfferForm
      title={object.title}
      id={object.id}
      floor={bidding ? currentBid : object.price}
      floorLabel={bidding ? "current bid" : "listed price"}
    />
  );

  const signInPrompt = (
    <p className="text-[11px] text-steel mt-3 leading-relaxed">
      <Link href="/account" className="underline">
        Sign in or register
      </Link>{" "}
      to bid.
    </p>
  );

  if (status === "sold") {
    return (
      <div className="border border-hairline p-5">
        <div className="flex items-center gap-2 text-sold text-[11px] font-mono uppercase tracking-wide mb-2">
          <span className="h-1.5 w-1.5 rounded-full bg-sold inline-block" />
          Gone
        </div>
        <p className="text-sm text-steel">Made once. Once gone - gone.</p>
      </div>
    );
  }

  if (!bidding) {
    return (
      <div className="border border-hairline p-5">
        <div className="text-2xl font-mono mb-1">
          <Price aud={object.price} />
        </div>
        <AudNote aud={object.price} />
        <button
          disabled={busy || !signedIn}
          onClick={() => {
            if (
              window.confirm(
                `Place the opening bid of ${formatAud(object.price)}? This starts the 24-hour clock.`
              )
            )
              bid(object.price);
          }}
          className={bigButton}
        >
          {busy ? "..." : "Start bidding"}
        </button>
        {!signedIn && signInPrompt}
        {error && (
          <p className="text-[11px] font-mono text-sold mt-3">{error}</p>
        )}
        <p className="text-[11px] text-steel mt-3 leading-relaxed">
          Opens at the listed price and starts a 24-hour clock. Highest bid
          wins. We&apos;ll tell you if you&apos;re outbid.
        </p>
        {offerBox}
      </div>
    );
  }

  const minNext = minNextBid(currentBid);

  return (
    <div className="border border-hairline p-5">
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-[11px] font-mono uppercase tracking-wide text-steel">
          {closed ? "Final bid" : "Current bid"}
        </span>
        <span className="text-[11px] font-mono text-steel">
          {closed ? "Closed" : countdown(msLeft)}
        </span>
      </div>
      <div className="text-2xl font-mono mb-1">
        <Price aud={currentBid} />
      </div>
      <AudNote aud={currentBid} />
      <div className="text-[11px] font-mono text-steel mb-4">
        {bidCount} bid{bidCount === 1 ? "" : "s"}
        {leading && !closed ? " · you are the highest bidder" : ""}
      </div>

      {closed ? (
        <p className="text-sm text-steel">Bidding has closed on this piece.</p>
      ) : (
        <>
          <div className="flex gap-2">
            <input
              type="number"
              min={minNext}
              placeholder={String(minNext)}
              value={bidInput}
              onChange={(e) => setBidInput(e.target.value)}
              className="flex-1 border border-hairline px-3 py-2 text-sm font-mono bg-background"
            />
            <button
              disabled={busy || !signedIn}
              onClick={() => {
                const val = Number(bidInput);
                if (!val || val < minNext) {
                  setError(`The minimum bid is ${formatAud(minNext)}.`);
                  return;
                }
                bid(val);
              }}
              className="border border-foreground px-4 text-[11px] font-mono uppercase tracking-wide hover:bg-foreground hover:text-background transition-colors disabled:opacity-40"
            >
              {busy ? "..." : "Place bid"}
            </button>
          </div>
          {!signedIn && signInPrompt}
          {error && (
            <p className="text-[11px] font-mono text-sold mt-3">{error}</p>
          )}
          <p className="text-[11px] text-steel mt-3">
            Minimum next bid: {formatAud(minNext)}. Bids are in AUD.
          </p>
          <p className="text-[11px] text-steel mt-1 leading-relaxed">
            A bid in the last {ANTI_SNIPE_MINUTES} minutes adds{" "}
            {ANTI_SNIPE_MINUTES} minutes to the clock.
          </p>
        </>
      )}
      {offerBox}
    </div>
  );
}
