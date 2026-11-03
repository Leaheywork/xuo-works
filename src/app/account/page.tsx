"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase, supabaseConfigured } from "@/lib/supabase";

const field = "w-full border border-hairline px-3 py-2 text-sm bg-background";
const button =
  "border border-foreground px-5 py-2 text-[11px] font-mono uppercase tracking-wide hover:bg-foreground hover:text-background transition-colors disabled:opacity-40";

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<"signin" | "register">("register");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!supabaseConfigured) {
      setReady(true);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") ?? "");
    const password = String(f.get("password") ?? "");
    const name = String(f.get("name") ?? "");

    if (mode === "register") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${window.location.origin}/account`,
        },
      });
      if (error) setError(error.message);
      else if (!data.session)
        setMessage(
          "Check your email. Click the link we sent to finish registering."
        );
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setError(error.message);
    }
    setBusy(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setMessage("");
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="uppercase tracking-wide text-sm font-semibold mb-6 border-b border-hairline pb-3">
        Account
      </h1>

      {!supabaseConfigured && (
        <p className="text-sm text-steel">Accounts aren&apos;t connected yet.</p>
      )}

      {supabaseConfigured && !ready && (
        <p className="text-sm text-steel">Loading&hellip;</p>
      )}

      {supabaseConfigured && ready && user && (
        <div className="max-w-md space-y-4">
          <p className="text-sm">
            Signed in as <span className="font-mono">{user.email}</span>
          </p>
          <p className="text-sm text-steel leading-relaxed">
            You&apos;re registered. You can bid on pieces once bidding opens.
          </p>
          <button onClick={signOut} className={button}>
            Sign out
          </button>
        </div>
      )}

      {supabaseConfigured && ready && !user && (
        <div className="max-w-md">
          <div className="flex gap-4 mb-5 text-[11px] font-mono uppercase tracking-wide">
            <button
              onClick={() => setMode("register")}
              className={
                mode === "register"
                  ? "border-b border-foreground pb-1"
                  : "text-steel pb-1 hover:text-foreground"
              }
            >
              Register
            </button>
            <button
              onClick={() => setMode("signin")}
              className={
                mode === "signin"
                  ? "border-b border-foreground pb-1"
                  : "text-steel pb-1 hover:text-foreground"
              }
            >
              Sign in
            </button>
          </div>
          <p className="text-sm text-steel leading-relaxed mb-4">
            {mode === "register"
              ? "Register to bid. We'll email you if you're outbid."
              : "Welcome back."}
          </p>
          <form onSubmit={onSubmit} className="space-y-3">
            {mode === "register" && (
              <input
                name="name"
                type="text"
                required
                placeholder="Your name"
                className={field}
              />
            )}
            <input
              name="email"
              type="email"
              required
              placeholder="Your email"
              className={field}
            />
            <input
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="Password (8+ characters)"
              className={field}
            />
            <button type="submit" disabled={busy} className={button}>
              {busy ? "..." : mode === "register" ? "Register" : "Sign in"}
            </button>
          </form>
          {message && <p className="mt-4 text-sm">{message}</p>}
          {error && (
            <p className="mt-4 text-[11px] font-mono text-sold">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
