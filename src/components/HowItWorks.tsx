import { ANTI_SNIPE_MINUTES } from "@/lib/bidding";

const STEPS = [
  {
    n: "1",
    title: "Pick an object",
    body: "Every piece here is one of one. Each is made by hand, once, and never repeated.",
  },
  {
    n: "2",
    title: "Add a card and bid",
    body: `Bidding opens at the listed price. The first bid starts a 24-hour clock, and the highest bid when it ends wins. A bid in the last ${ANTI_SNIPE_MINUTES} minutes adds time. Your card is only charged if you win.`,
  },
  {
    n: "3",
    title: "It's yours",
    body: "The winning bid is charged and your piece ships within 5 business days. We email you if you're outbid, and when bidding closes.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="max-w-6xl mx-auto px-6 pb-10 scroll-mt-4">
      <div className="grid md:grid-cols-3 gap-px bg-hairline border border-hairline">
        {STEPS.map((s) => (
          <div key={s.n} className="bg-background p-5">
            <div className="text-[11px] font-mono text-steel mb-2">
              {s.n} / 3
            </div>
            <h2 className="uppercase tracking-wide text-sm font-semibold mb-2">
              {s.title}
            </h2>
            <p className="text-sm text-steel leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
      <p className="text-[11px] font-mono text-steel mt-3">
        Would rather make an offer? Offers above the listed price are
        considered. Prices are in AUD.
      </p>
    </section>
  );
}
