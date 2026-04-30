import Link from "next/link";
import Image from "next/image";
import FeatherIcon from "feather-icons-react";
import { Property } from "@/lib/types";
import { formatPrice } from "@/lib/data";

export default function PropertyCard({ property }: { property: Property }) {
  return (
    <Link href={`/listings/${property.id}`} className="group block">
      <div className="bg-white border border-beige-dark/30 overflow-hidden hover:shadow-lg transition-all duration-300">
        {/* Image */}
        <div className="relative h-64 overflow-hidden">
          <Image
            src={property.image}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Status Badge */}
          <div className="absolute top-4 left-4">
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
          </div>
          {/* Price */}
          <div className="absolute bottom-4 left-4">
            <span className="bg-white/95 backdrop-blur-sm px-4 py-2 text-lg font-semibold text-accent">
              {formatPrice(property.price)}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-5">
          <h3 className="text-lg font-semibold text-accent mb-1 group-hover:text-accent-light transition-colors">
            {property.title}
          </h3>
          <p className="text-sm text-muted flex items-center gap-1 mb-4">
            <FeatherIcon icon="map-pin" size={14} />
            {property.address}, {property.city}, {property.state}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-5 text-sm text-muted border-t border-beige-dark/30 pt-4">
            <span className="flex items-center gap-1.5">
              <FeatherIcon icon="moon" size={14} />
              {property.bedrooms} Beds
            </span>
            <span className="flex items-center gap-1.5">
              <FeatherIcon icon="droplet" size={14} />
              {property.bathrooms} Baths
            </span>
            <span className="flex items-center gap-1.5">
              <FeatherIcon icon="maximize" size={14} />
              {property.sqft.toLocaleString()} sqft
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
