import { NextResponse } from "next/server";
import { adminClient, serverConfigured, stripe, userFromRequest } from "@/lib/server";

// Starts Stripe's secure page where a bidder saves a card. Nothing is charged.
export async function POST(req: Request) {
  if (!serverConfigured)
    return NextResponse.json({ error: "Payments are not connected yet." }, { status: 503 });

  const user = await userFromRequest(req);
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  try {
    const db = adminClient();
    const { data: profile } = await db
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    let customer = profile?.stripe_customer_id as string | null | undefined;
    if (!customer) {
      const c = await stripe<{ id: string }>("/customers", {
        email: user.email ?? "",
        "metadata[user_id]": user.id,
      });
      customer = c.id;
      await db.from("profiles").update({ stripe_customer_id: customer }).eq("id", user.id);
    }

    const origin = req.headers.get("origin") ?? "https://www.xuo.works";
    const session = await stripe<{ url: string }>("/checkout/sessions", {
      mode: "setup",
      customer,
      "payment_method_types[0]": "card",
      success_url: `${origin}/account?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/account`,
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Something went wrong." },
      { status: 500 }
    );
  }
}
