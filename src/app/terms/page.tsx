import Link from "next/link";
import LegalPage, { H } from "@/components/LegalPage";

export const metadata = { title: "Terms — XUO.WORKS" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms">
      <p>
        XUO.WORKS sells one-off objects made by the artist. By registering,
        bidding or buying you agree to these terms.
      </p>

      <H>Accounts and cards</H>
      <p>
        You need an account and a card saved on file before you can bid. Cards
        are handled by Stripe. We never see or store your full card number.
      </p>

      <H>How bidding works</H>
      <p>
        Bidding opens at the listed price and starts a 24-hour clock. The
        highest bid when the clock ends wins. A bid placed in the last few
        minutes extends the clock, so nobody gets sniped. Each bid must beat the
        current bid by the minimum step shown on the piece.
      </p>
      <p>
        <strong>Every bid is binding.</strong> If you win, the amount of your
        winning bid is charged to your saved card when the clock ends. We will
        email you, and anyone you outbid, when bidding closes.
      </p>

      <H>Offers</H>
      <p>
        You can make an offer on a piece. Only offers above the listed price
        are considered, and an offer is not a purchase until we accept it.
      </p>

      <H>Prices and GST</H>
      <p>
        All prices and charges are in Australian dollars (AUD). If you view the
        site in another currency, that is only a guide. GST is added where it
        applies.
      </p>

      <H>Pieces</H>
      <p>
        Each piece is handmade and one of a kind. Photos are as accurate as we
        can make them, but small differences in colour and finish are part of
        the work. Once a piece is sold, it is gone.
      </p>

      <H>Shipping and returns</H>
      <p>
        See <Link href="/shipping" className="underline">Shipping</Link> and{" "}
        <Link href="/returns" className="underline">Returns</Link>. Nothing in
        these terms limits your rights under the Australian Consumer Law.
      </p>

      <H>Contact</H>
      <p>
        Questions? Use the form on the{" "}
        <Link href="/#commission" className="underline">home page</Link>.
      </p>
    </LegalPage>
  );
}
