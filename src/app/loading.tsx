import React from 'react';
import { VehicleCardSkeleton } from '@/components/ui/VehicleCardSkeleton';
import { Car } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-400 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Loading Spinner Header */}
        <div className="flex flex-col items-center justify-center py-10 space-y-4">
          <Car className="h-10 w-10 text-brand-red animate-pulse" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-300">
            Cargando Catálogo Mr. Car...
          </h2>
        </div>

        {/* Catalog Grid Skeleton */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <VehicleCardSkeleton key={i} />
          ))}
        </div>

      </div>
    </div>
  );
}
