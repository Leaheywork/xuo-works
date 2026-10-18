// Sign-up box for "tell me when new pieces drop".
// Sign-ups go to a Buttondown newsletter account.
// After creating the Buttondown account, put its username here.
const BUTTONDOWN_USERNAME = "";

export default function SubscribeForm() {
  const connected = BUTTONDOWN_USERNAME !== "";

  // Don't show a dead form on the live site until the account is connected.
  if (!connected && process.env.NODE_ENV === "production") return null;

  return (
    <section className="max-w-6xl mx-auto px-6 py-12 border-t border-hairline">
      <h2 className="uppercase tracking-wide text-sm font-semibold mb-3">
        Made once. Once gone - gone.
      </h2>
      <p className="text-sm text-steel leading-relaxed mb-4">
        Contact me when other useless / unique objects are created.
      </p>
      <form
        action={
          connected
            ? `https://buttondown.com/api/emails/embed-subscribe/${BUTTONDOWN_USERNAME}`
            : undefined
        }
        method="post"
        target="_blank"
        className="flex flex-col sm:flex-row gap-2 max-w-md"
      >
        <input
          type="email"
          name="email"
          required
          placeholder="Your email"
          className="flex-1 border border-hairline px-3 py-2 text-sm bg-background"
        />
        <input type="hidden" name="embed" value="1" />
        <button
          type="submit"
          disabled={!connected}
          className="border border-foreground px-5 py-2 text-[11px] font-mono uppercase tracking-wide hover:bg-foreground hover:text-background transition-colors disabled:opacity-40"
        >
          Contact me
        </button>
      </form>
      {!connected && (
        <p className="mt-2 text-[11px] font-mono text-steel">
          Preview only — not connected to an email list yet.
        </p>
      )}
    </section>
  );
}
