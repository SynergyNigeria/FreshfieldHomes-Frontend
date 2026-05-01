"use client";

import { useMemo } from "react";
import PropertyCard from "@/components/PropertyCard";
import PartialPayCard from "@/components/PartialPayCard";
import type { Property, PartialHome } from "@/lib/types";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function ShuffledPropertiesGrid({
  items,
  className,
}: {
  items: Property[];
  className?: string;
}) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const shuffled = useMemo(() => shuffle(items), []);
  return (
    <div className={className}>
      {shuffled.map((p) => (
        <PropertyCard key={p.id} property={p} />
      ))}
    </div>
  );
}

export function ShuffledPartialHomesGrid({
  items,
  limit,
  className,
}: {
  items: PartialHome[];
  limit?: number;
  className?: string;
}) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const shuffled = useMemo(() => shuffle(items), []);
  const displayed = limit !== undefined ? shuffled.slice(0, limit) : shuffled;
  return (
    <div className={className}>
      {displayed.map((h) => (
        <PartialPayCard key={h.id} home={h} />
      ))}
    </div>
  );
}
