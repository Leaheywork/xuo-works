import { notFound } from "next/navigation";
import { getAllObjects, getObjectById } from "@/lib/data";
import Gallery from "./Gallery";
import BuyBox from "./BuyBox";

export function generateStaticParams() {
  return getAllObjects().map((o) => ({ id: o.id }));
}

export default async function ObjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const object = getObjectById(id);
  if (!object) notFound();

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="grid md:grid-cols-2 gap-10">
        <Gallery images={object.images} title={object.title} />
        <div>
          <h1 className="uppercase tracking-wide text-xl font-semibold mb-2">
            {object.title}
          </h1>
          <p className="text-sm text-steel mb-6">{object.description}</p>

          <dl className="grid grid-cols-2 gap-y-2 text-[12px] font-mono mb-6 border-t border-hairline pt-4">
            <dt className="text-steel uppercase tracking-wide">Materials</dt>
            <dd>{object.materials}</dd>
            <dt className="text-steel uppercase tracking-wide">Dimensions</dt>
            <dd>{object.dimensions}</dd>
            <dt className="text-steel uppercase tracking-wide">Weight</dt>
            <dd>{object.weightKg} kg</dd>
            <dt className="text-steel uppercase tracking-wide">Year</dt>
            <dd>{object.year}</dd>
          </dl>

          <BuyBox object={object} />
        </div>
      </div>
    </div>
  );
}
