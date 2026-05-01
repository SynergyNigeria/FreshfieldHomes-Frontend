import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import FeatherIcon from "feather-icons-react";
import { getProperties, getPropertyById } from "@/lib/api";
import { formatPrice } from "@/lib/data";
import PhotoGallery from "@/components/PhotoGallery";

interface Props {
  params: Promise<{ id: string }>;
}

export const generateStaticParams = async () => {
  try {
    const properties = await getProperties();
    return properties.map((p) => ({ id: String(p.id) }));
  } catch {
    return [];
  }
};

export default async function PropertyDetailPage({ params }: Props) {
  const { id } = await params;
  const property = await getPropertyById(id);

  if (!property) return notFound();

  return (
    <>
      {/* Image Gallery */}
      <section className="bg-beige-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <PhotoGallery images={property.images} title={property.title} />
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <span
                  className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                    property.status === "for-sale"
                      ? "bg-accent text-white"
                      : property.status === "pending"
                      ? "bg-beige-dark text-accent"
                      : "bg-muted text-white"
                  }`}
                >
                  {property.status === "for-sale" ? "For Sale" : property.status === "pending" ? "Pending" : "Sold"}
                </span>
                <span className="text-xs text-muted uppercase tracking-wider">
                  {property.type}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-accent mb-2">
                {property.title}
              </h1>
              <p className="text-muted flex items-center gap-1">
                <FeatherIcon icon="map-pin" size={16} />
                {property.address}, {property.city}, {property.state}
              </p>
            </div>

            {/* Price & Stats */}
            <div className="bg-beige-light p-6 mb-8">
              <p className="text-3xl font-bold text-accent mb-4">
                {formatPrice(property.price)}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {[
                  { icon: "moon", label: "Bedrooms", value: property.bedrooms },
                  { icon: "droplet", label: "Bathrooms", value: property.bathrooms },
                  { icon: "maximize", label: "Sq Ft", value: property.sqft.toLocaleString() },
                  { icon: "calendar", label: "Year Built", value: property.yearBuilt },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="flex items-center gap-2 text-muted mb-1">
                      <FeatherIcon icon={stat.icon} size={16} />
                      <span className="text-xs uppercase tracking-wider">{stat.label}</span>
                    </div>
                    <p className="text-lg font-semibold text-accent">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-accent mb-4">About This Property</h2>
              <p className="text-muted leading-relaxed">{property.description}</p>
            </div>

            {/* Features */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-accent mb-4">Features & Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-2 text-sm text-muted p-3 bg-beige-light"
                  >
                    <FeatherIcon icon="check" size={16} className="text-accent" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Agent Card */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-beige-dark/30 p-6 sticky top-28">
              <h3 className="text-lg font-semibold text-accent mb-4">Listing Agent</h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative w-16 h-16 rounded-full overflow-hidden">
                  <Image
                    src={property.agent.image}
                    alt={property.agent.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-accent">{property.agent.name}</p>
                  <p className="text-sm text-muted">{property.agent.phone}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <Link
                  href={`/chat?propertyId=${property.id}&agentId=${property.agent.id}&propertyTitle=${encodeURIComponent(property.title)}`}
                  className="flex items-center justify-center gap-2 w-full bg-accent text-white px-5 py-3 text-sm font-medium hover:bg-accent-light transition-colors duration-200"
                >
                  <FeatherIcon icon="message-circle" size={16} />
                  Chat with Agent
                </Link>
                <a
                  href={`mailto:${property.agent.email}`}
                  className="flex items-center justify-center gap-2 w-full border border-accent text-accent px-5 py-3 text-sm font-medium hover:bg-beige-light transition-colors duration-200"
                >
                  <FeatherIcon icon="mail" size={16} />
                  Email Agent
                </a>
              </div>

              <div className="border-t border-beige-dark/30 pt-4">
                <p className="text-xs text-muted text-center">
                  Typically responds within 30 minutes
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Back Link */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <Link
          href="/listings"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors"
        >
          <FeatherIcon icon="arrow-left" size={16} />
          Back to Listings
        </Link>
      </section>
    </>
  );
}
