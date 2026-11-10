"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import CardBox from "./CardBox";

const field = "w-full border border-hairline px-3 py-2 text-sm bg-background";
const button =
  "border border-foreground px-5 py-2 text-[11px] font-mono uppercase tracking-wide hover:bg-foreground hover:text-background transition-colors disabled:opacity-40";

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<
    "signin" | "register" | "forgot" | "newpassword"
  >("register");
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
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === "PASSWORD_RECOVERY") setMode("newpassword");
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
    } else if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/account`,
      });
      if (error) setError(error.message);
      else
        setMessage(
          "If that email is registered, a reset link is on its way. Check your email."
        );
    } else if (mode === "newpassword") {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) setError(error.message);
      else {
        setMessage("Password changed. You're signed in.");
        setMode("signin");
      }
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

      {supabaseConfigured && ready && mode === "newpassword" && (
        <div className="max-w-md">
          <p className="text-sm text-steel leading-relaxed mb-4">
            Choose a new password.
          </p>
          <form onSubmit={onSubmit} className="space-y-3">
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="New password (8+ characters)"
              className={field}
            />
            <button type="submit" disabled={busy} className={button}>
              {busy ? "..." : "Save password"}
            </button>
          </form>
          {message && <p className="mt-4 text-sm">{message}</p>}
          {error && (
            <p className="mt-4 text-[11px] font-mono text-sold">{error}</p>
          )}
        </div>
      )}

      {supabaseConfigured && ready && user && mode !== "newpassword" && (
        <div className="max-w-md space-y-4">
          <p className="text-sm">
            Signed in as <span className="font-mono">{user.email}</span>
          </p>
          <CardBox user={user} />
          <button onClick={signOut} className={button}>
            Sign out
          </button>
        </div>
      )}

      {supabaseConfigured && ready && !user && mode !== "newpassword" && (
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
              : mode === "forgot"
              ? "Enter your email. We'll send a link to set a new password."
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
              autoComplete="username"
              inputMode="email"
              required
              placeholder="Your email"
              className={field}
            />
            {mode !== "forgot" && (
              <input
                name="password"
                type="password"
                autoComplete={mode === "register" ? "new-password" : "current-password"}
                required
                minLength={8}
                placeholder="Password (8+ characters)"
                className={field}
              />
            )}
            <button type="submit" disabled={busy} className={button}>
              {busy
                ? "..."
                : mode === "register"
                ? "Register"
                : mode === "forgot"
                ? "Send reset link"
                : "Sign in"}
            </button>
          </form>
          {mode === "signin" && (
            <button
              onClick={() => {
                setMode("forgot");
                setError("");
                setMessage("");
              }}
              className="mt-4 text-[11px] font-mono uppercase tracking-wide text-steel hover:text-foreground"
            >
              Forgot password?
            </button>
          )}
          {message && <p className="mt-4 text-sm">{message}</p>}
          {error && (
            <p className="mt-4 text-[11px] font-mono text-sold">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
