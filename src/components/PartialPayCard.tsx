import Link from "next/link";
import Image from "next/image";
import FeatherIcon from "feather-icons-react";
import { PartialHome } from "@/lib/types";
import { formatPrice } from "@/lib/data";

export default function PartialPayCard({ home }: { home: PartialHome }) {
  return (
    <Link href={`/partial-homes/${home.id}`} className="group block">
      <div className="bg-white border border-beige-dark/30 overflow-hidden hover:shadow-lg transition-all duration-300">
        {/* Image */}
        <div className="relative h-56 overflow-hidden">
          <Image
            src={home.image}
            alt={home.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Badge */}
          <div className="absolute top-4 left-4">
            <span className="bg-amber-500 text-white px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              Partially Paid
            </span>
          </div>
          {/* Percent pill */}
          <div className="absolute top-4 right-4">
            <span className="bg-white/95 backdrop-blur-sm text-accent px-3 py-1 text-xs font-bold">
              {home.percentagePaid}% Paid
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-beige-dark/30">
          <div
            className="h-full bg-amber-500 transition-all duration-500"
            style={{ width: `${home.percentagePaid}%` }}
          />
        </div>

        {/* Info */}
        <div className="p-5">
          <h3 className="text-lg font-semibold text-accent mb-1 group-hover:text-accent-light transition-colors">
            {home.title}
          </h3>
          <p className="text-sm text-muted flex items-center gap-1 mb-4">
            <FeatherIcon icon="map-pin" size={14} />
            {home.address}, {home.city}, {home.state}
          </p>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-beige-light p-3">
              <p className="text-xs text-muted mb-0.5">Full Price</p>
              <p className="text-sm font-bold text-accent">{formatPrice(home.fullPrice)}</p>
            </div>
            <div className="bg-amber-50 p-3">
              <p className="text-xs text-muted mb-0.5">Remaining</p>
              <p className="text-sm font-bold text-amber-600">{formatPrice(home.remainingAmount)}</p>
            </div>
          </div>

          {/* Stats + payer */}
          <div className="flex items-center justify-between text-xs text-muted border-t border-beige-dark/30 pt-4">
            <span className="flex items-center gap-1">
              <FeatherIcon icon="moon" size={13} />
              {home.bedrooms} Beds
            </span>
            <span className="flex items-center gap-1">
              <FeatherIcon icon="droplet" size={13} />
              {home.bathrooms} Baths
            </span>
            <span className="flex items-center gap-1">
              <FeatherIcon icon="maximize" size={13} />
              {home.sqft.toLocaleString()} sqft
            </span>
            <span className="flex items-center gap-1">
              <FeatherIcon icon="user" size={13} />
              Owner Protected
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
