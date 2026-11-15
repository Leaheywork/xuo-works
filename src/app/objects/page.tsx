import { redirect } from "next/navigation";

// The objects now live on the home page.
export default function ObjectsPage() {
  redirect("/#objects");
}
