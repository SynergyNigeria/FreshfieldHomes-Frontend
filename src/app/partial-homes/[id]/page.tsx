import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import FeatherIcon from "feather-icons-react";
import { getPartialHomeById, getPartialHomes } from "@/lib/api";
import SecurePaymentInfo from "@/components/SecurePaymentInfo";

export const generateStaticParams = async () => {
  try {
    const homes = await getPartialHomes();
    return homes.map((h) => ({ id: String(h.id) }));
  } catch {
    return [];
  }
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const home = await getPartialHomeById(id);
  if (!home) return { title: "Not Found" };
  return {
    title: `${home.title} | Partial Homes | Fresh Fields Homes`,
    description: home.description,
  };
}

export default async function PartialHomeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const home = await getPartialHomeById(id);
  if (!home) notFound();

  return (
    <>
      {/* Back */}
      <div className="bg-beige-light border-b border-beige-dark/30 px-4 py-4">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/partial-homes"
            className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors"
          >
            <FeatherIcon icon="arrow-left" size={15} />
            Back to Partial Homes
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: images + details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 relative h-80 overflow-hidden">
                <Image
                  src={home.images[0]}
                  alt={home.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-amber-500 text-white px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                    Partially Paid
                  </span>
                </div>
              </div>
              {home.images.slice(1).map((img, i) => (
                <div key={i} className="relative h-48 overflow-hidden">
                  <Image
                    src={img}
                    alt={`${home.title} ${i + 2}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              ))}
            </div>

            {/* Title */}
            <div>
              <h1 className="text-3xl font-bold text-accent mb-2">{home.title}</h1>
              <p className="flex items-center gap-1.5 text-muted">
                <FeatherIcon icon="map-pin" size={16} />
                {home.address}, {home.city}, {home.state}
              </p>
            </div>

            {/* Key stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: "moon", label: "Bedrooms", value: home.bedrooms },
                { icon: "droplet", label: "Bathrooms", value: home.bathrooms },
                { icon: "maximize", label: "Sq. Ft.", value: home.sqft.toLocaleString() },
                { icon: "home", label: "Type", value: home.type.charAt(0).toUpperCase() + home.type.slice(1) },
                { icon: "calendar", label: "Year Built", value: home.yearBuilt },
                { icon: "percent", label: "Paid", value: `${home.percentagePaid}%` },
              ].map((s) => (
                <div key={s.label} className="bg-beige-light p-4 flex flex-col gap-1">
                  <FeatherIcon icon={s.icon} size={18} className="text-muted" />
                  <p className="text-xs text-muted">{s.label}</p>
                  <p className="font-semibold text-accent">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold text-accent mb-3">About this property</h2>
              <p className="text-muted leading-relaxed">{home.description}</p>
            </div>

            {/* Features */}
            <div>
              <h2 className="text-xl font-semibold text-accent mb-4">Features &amp; Amenities</h2>
              <ul className="grid grid-cols-2 gap-3">
                {home.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted">
                    <FeatherIcon icon="check" size={15} className="text-amber-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-5">
            <SecurePaymentInfo home={home} />
          </div>
        </div>
      </div>
    </>
  );
}
