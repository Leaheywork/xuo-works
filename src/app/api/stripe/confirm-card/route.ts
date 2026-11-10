import { NextResponse } from "next/server";
import { adminClient, serverConfigured, stripe, userFromRequest } from "@/lib/server";

interface Session {
  customer: string;
  setup_intent: { status: string; payment_method: string } | null;
}

// Called when the bidder returns from Stripe. Checks the card was really
// saved, then marks the account as ready to bid.
export async function POST(req: Request) {
  if (!serverConfigured)
    return NextResponse.json({ error: "Payments are not connected yet." }, { status: 503 });

  const user = await userFromRequest(req);
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  try {
    const { session_id } = (await req.json()) as { session_id?: string };
    if (!session_id) return NextResponse.json({ error: "Missing session." }, { status: 400 });

    const db = adminClient();
    const { data: profile } = await db
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    const s = await stripe<Session>(
      `/checkout/sessions/${encodeURIComponent(session_id)}`,
      { "expand[0]": "setup_intent" },
      "GET"
    );

    if (!profile?.stripe_customer_id || s.customer !== profile.stripe_customer_id)
      return NextResponse.json({ error: "That session is not yours." }, { status: 403 });
    if (s.setup_intent?.status !== "succeeded")
      return NextResponse.json({ error: "Card was not saved." }, { status: 400 });

    // Make this the card that is charged if they win.
    await stripe(`/customers/${s.customer}`, {
      "invoice_settings[default_payment_method]": s.setup_intent.payment_method,
    });
    await db.from("profiles").update({ has_card: true }).eq("id", user.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Something went wrong." },
      { status: 500 }
    );
  }
}
