import { getAllObjects } from "@/lib/data";
import ObjectsGrid from "./ObjectsGrid";

export const metadata = {
  title: "Objects — XUO.WORKS",
};

export default function ObjectsPage() {
  const objects = getAllObjects();

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="border-b border-hairline pb-4 mb-6">
        <h1 className="uppercase tracking-wide text-lg font-semibold">
          All objects
        </h1>
        <p className="text-sm text-steel mt-1 max-w-xl">
          Every object here is one of one. Buy at the listed price, or watch
          the 24-hour window and place a higher offer before it closes.
        </p>
      </div>
      <ObjectsGrid objects={objects} />
    </div>
  );
}
