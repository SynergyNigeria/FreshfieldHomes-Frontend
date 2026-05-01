"use client";

import { useMemo, ReactNode } from "react";

interface Props<T> {
  items: T[];
  limit?: number;
  renderItem: (item: T) => ReactNode;
  className?: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ShuffledGrid<T>({
  items,
  limit,
  renderItem,
  className,
}: Props<T>) {
  // useMemo with no deps runs once per mount → random order per page load, stable during the session
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const shuffled = useMemo(() => shuffle(items), []);
  const displayed = limit !== undefined ? shuffled.slice(0, limit) : shuffled;

  return <div className={className}>{displayed.map(renderItem)}</div>;
}
