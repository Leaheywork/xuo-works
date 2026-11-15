import Link from "next/link";
import LegalPage, { H } from "@/components/LegalPage";

export const metadata = { title: "Returns — XUO.WORKS" };

export default function ReturnsPage() {
  return (
    <LegalPage title="Returns">
      <H>Change of mind</H>
      <p>
        Every piece is one of a kind and bids are binding, so we do not accept
        returns if you change your mind.
      </p>

      <H>Damaged, lost or not as described</H>
      <p>
        If your piece arrives damaged, goes missing in transit, or is not as
        described, we will make it right with a repair, a replacement or a
        refund. Tell us within 7 days of delivery and include photos. Use the
        form on the{" "}
        <Link href="/#commission" className="underline">home page</Link> and
        mark it as a returns enquiry.
      </p>

      <H>Your rights</H>
      <p>
        Our goods come with guarantees that cannot be excluded under the
        Australian Consumer Law. Nothing on this page limits those rights.
      </p>
    </LegalPage>
  );
}
