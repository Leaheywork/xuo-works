import SubscribeForm from "@/components/SubscribeForm";
import ContactForm from "@/components/ContactForm";
import HowItWorks from "@/components/HowItWorks";
import ObjectsGrid from "@/app/objects/ObjectsGrid";
import { getAllObjects } from "@/lib/data";

export const revalidate = 60;

export default async function Home() {
  const objects = await getAllObjects();

  return (
    <div>
      <section className="max-w-6xl mx-auto px-6 pt-12 pb-8">
        <h1 className="uppercase tracking-wide text-2xl sm:text-3xl font-semibold">
          Made by hand. Made once.
        </h1>
        <p className="text-base text-steel mt-3 max-w-2xl leading-relaxed">
          One-off sculptural objects, sold by 24-hour auction. When a piece is
          gone, it&apos;s gone.
        </p>
      </section>

      <HowItWorks />

      <section id="objects" className="max-w-6xl mx-auto px-6 pb-12 scroll-mt-4">
        <ObjectsGrid objects={objects} />
      </section>

      <SubscribeForm />

      <section
        id="commission"
        className="max-w-6xl mx-auto px-6 pb-16 pt-12 border-t border-hairline"
      >
        <h2 className="uppercase tracking-wide text-sm font-semibold mb-3">
          Commissions
        </h2>
        <p className="text-sm text-steel leading-relaxed mb-5">
          Need something useless / unique made? The studio fabricates
          one-off objects to order.
        </p>
        <ContactForm />
      </section>
    </div>
  );
}
