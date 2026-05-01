"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import FeatherIcon from "feather-icons-react";

interface Props {
  images: string[];
  title: string;
}

export default function PhotoGallery({ images, title }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = useCallback((index: number) => setLightboxIndex(index), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const prev = useCallback(() => {
    setLightboxIndex((i) => (i === null ? 0 : (i - 1 + images.length) % images.length));
  }, [images.length]);

  const next = useCallback(() => {
    setLightboxIndex((i) => (i === null ? 0 : (i + 1) % images.length));
  }, [images.length]);

  // Keyboard nav
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxIndex, prev, next, closeLightbox]);

  if (!images.length) return null;

  return (
    <>
      {/* Mobile: swipeable scroll */}
      <div className="md:hidden">
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2">
          {images.map((img, i) => (
            <div key={img + i} className="relative h-72 min-w-full overflow-hidden snap-center">
              <Image
                src={img}
                alt={`${title} - ${i + 1}`}
                fill
                className="object-cover"
                priority={i === 0}
              />
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted">Swipe to view all photos</p>
      </div>

      {/* Desktop: 3-photo grid with "see all" overlay */}
      <div className="hidden md:grid grid-cols-3 gap-4 h-125">
        {/* Main large image */}
        <div
          className="col-span-2 relative overflow-hidden cursor-pointer group"
          onClick={() => openLightbox(0)}
        >
          <Image
            src={images[0]}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            priority
          />
        </div>

        {/* Right column: 2 thumbnails + optional "see all" badge */}
        <div className="grid grid-rows-2 gap-4">
          {[1, 2].map((slot) => {
            const img = images[slot];
            const isLast = slot === 2;
            const remaining = images.length - 3;

            if (!img) return <div key={slot} className="bg-beige-light" />;

            return (
              <div
                key={slot}
                className="relative overflow-hidden cursor-pointer group"
                onClick={() => openLightbox(slot)}
              >
                <Image
                  src={img}
                  alt={`${title} - ${slot + 1}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* "See all" overlay on the last visible thumbnail if more photos exist */}
                {isLast && remaining > 0 && (
                  <div
                    className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center gap-1"
                    onClick={(e) => { e.stopPropagation(); openLightbox(3); }}
                  >
                    <FeatherIcon icon="grid" size={22} className="text-white" />
                    <span className="text-white font-semibold text-sm">
                      +{remaining} more photo{remaining !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white z-10"
            onClick={closeLightbox}
            aria-label="Close"
          >
            <FeatherIcon icon="x" size={28} />
          </button>

          {/* Counter */}
          <span className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
            {lightboxIndex + 1} / {images.length}
          </span>

          {/* Prev */}
          {images.length > 1 && (
            <button
              className="absolute left-4 text-white/80 hover:text-white z-10 bg-black/30 rounded-full p-2"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="Previous"
            >
              <FeatherIcon icon="chevron-left" size={28} />
            </button>
          )}

          {/* Image */}
          <div
            className="relative w-full h-full max-w-5xl max-h-[85vh] mx-auto px-16"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[lightboxIndex]}
              alt={`${title} - ${lightboxIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>

          {/* Next */}
          {images.length > 1 && (
            <button
              className="absolute right-4 text-white/80 hover:text-white z-10 bg-black/30 rounded-full p-2"
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label="Next"
            >
              <FeatherIcon icon="chevron-right" size={28} />
            </button>
          )}

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 overflow-x-auto px-4">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                  className={`relative h-14 w-20 shrink-0 overflow-hidden border-2 transition-all ${
                    i === lightboxIndex ? "border-white" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image src={img} alt={`thumb ${i + 1}`} fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
