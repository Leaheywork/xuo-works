import Link from "next/link";
import LegalPage, { H } from "@/components/LegalPage";

export const metadata = { title: "Shipping — XUO.WORKS" };

export default function ShippingPage() {
  return (
    <LegalPage title="Shipping">
      <H>When it ships</H>
      <p>
        We ship within 5 business days of payment, usually sooner. You will get
        an email with tracking once your piece is on its way.
      </p>

      <H>Packing</H>
      <p>
        Pieces are packed by the artist to survive the trip. Heavy or fragile
        works may be crated, which can add a little time. If that is the case
        we will tell you straight away.
      </p>

      <H>Delivery costs and times</H>
      <p>
        Delivery depends on the weight, size and destination of the piece. We
        confirm the cost with you before your piece ships. Delivery times depend
        on the carrier.
      </p>

      <H>Damage in transit</H>
      <p>
        Check your piece when it arrives. If something is wrong, see{" "}
        <Link href="/returns" className="underline">Returns</Link>.
      </p>
    </LegalPage>
  );
}
