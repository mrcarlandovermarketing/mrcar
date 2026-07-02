import React from 'react';
import { Vehicle } from '@/domain/entities/vehicle';
import { VehicleCard } from '@/presentation/components/vehicle-card';

interface FeaturedVehiclesProps {
  vehicles: Vehicle[];
}

export function FeaturedVehicles({ vehicles }: FeaturedVehiclesProps) {
  if (vehicles.length === 0) return null;

  return (
    <section className="w-full bg-zinc-950 py-16 border-b border-zinc-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="mb-10 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-red">
            Recomendados
          </span>
          <h2 className="text-3xl font-black text-white tracking-tight mt-1 sm:text-4xl">
            Vehículos Destacados
          </h2>
          <p className="mt-2 text-zinc-405 text-sm max-w-md mx-auto">
            Opciones seleccionadas que podrían ser perfectas para ti.
          </p>
        </div>

        {/* Grid List */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>

      </div>
    </section>
  );
}
export default FeaturedVehicles;
