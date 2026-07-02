"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface VehicleCarouselProps {
  photos: string[];
  mainPhoto: string;
  altText: string;
}

export function VehicleCarousel({ photos, mainPhoto, altText }: VehicleCarouselProps) {
  // Aggregate all photos, placing main photo first if it's not already in the array
  const allPhotos = [...photos];
  if (mainPhoto && !allPhotos.includes(mainPhoto)) {
    allPhotos.unshift(mainPhoto);
  }

  // If no photos exist, use our official local placeholder
  if (allPhotos.length === 0) {
    allPhotos.push('/placeholders/vehicle-placeholder.png');
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedUrls, setFailedUrls] = useState<Set<string>>(new Set());

  const handleImageError = (url: string) => {
    setFailedUrls((prev) => {
      const next = new Set(prev);
      next.add(url);
      return next;
    });
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? allPhotos.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === allPhotos.length - 1 ? 0 : prevIndex + 1));
  };

  const getPhotoSrc = (url: string) => {
    return failedUrls.has(url) ? '/placeholders/vehicle-placeholder.png' : url;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image Slider */}
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl">
        <Image
          src={getPhotoSrc(allPhotos[currentIndex])}
          alt={`${altText} - Imagen ${currentIndex + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 80vw"
          className="object-cover transition-all duration-300"
          onError={() => handleImageError(allPhotos[currentIndex])}
          priority={currentIndex === 0}
        />

        {/* Navigation Arrows */}
        {allPhotos.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-zinc-900/80 p-2 text-zinc-100 backdrop-blur-sm transition-all hover:bg-zinc-800 hover:text-white cursor-pointer z-10"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-zinc-900/80 p-2 text-zinc-100 backdrop-blur-sm transition-all hover:bg-zinc-800 hover:text-white cursor-pointer z-10"
              aria-label="Siguiente imagen"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Counter */}
        <div className="absolute bottom-4 right-4 rounded-md bg-zinc-900/75 px-2.5 py-1 text-xs font-medium text-zinc-300 backdrop-blur-sm z-10">
          {currentIndex + 1} / {allPhotos.length}
        </div>
      </div>

      {/* Thumbnails */}
      {allPhotos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-750">
          {allPhotos.map((photo, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`relative aspect-video w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 bg-zinc-900 transition-all cursor-pointer ${
                index === currentIndex ? 'border-brand-red scale-95' : 'border-zinc-800 hover:border-zinc-600'
              }`}
            >
              <Image
                src={getPhotoSrc(photo)}
                alt={`${altText} Miniatura ${index + 1}`}
                fill
                sizes="96px"
                className="object-cover"
                onError={() => handleImageError(photo)}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
export default VehicleCarousel;
