import React, { Suspense } from 'react';
import { createVehicleRepository } from '@/infrastructure/repositories/vehicle-repository-factory';
import { GetVehiclesUseCase } from '@/application/use-cases/get-vehicles.use-case';
import { GetFeaturedVehiclesUseCase } from '@/application/use-cases/get-featured-vehicles.use-case';
import { Hero } from '@/components/home/Hero';
import { QuickSearch } from '@/components/home/QuickSearch';
import { FeaturedVehicles } from '@/components/home/FeaturedVehicles';
import { VehicleCatalog } from '@/presentation/components/vehicle-catalog';
import { TrustBenefits } from '@/components/home/TrustBenefits';
import { FinancingSection } from '@/components/home/FinancingSection';
import { AboutSection } from '@/components/home/AboutSection';
import { CallToAction } from '@/components/home/CallToAction';
import { VehicleCardSkeleton } from '@/components/ui/VehicleCardSkeleton';

export const revalidate = 3600; // Cache for 1 hour, or revalidate dynamically

export default async function Home() {
  const repository = createVehicleRepository();
  const getVehicles = new GetVehiclesUseCase(repository);
  const getFeatured = new GetFeaturedVehiclesUseCase(repository);

  // Fetch active vehicles and featured vehicles concurrently
  const [vehicles, featuredVehicles] = await Promise.all([
    getVehicles.execute(),
    getFeatured.execute(),
  ]);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-brand-red selection:text-white">
      
      {/* Decorative Red Background Accents */}
      <div className="absolute top-[200px] left-1/4 h-[350px] w-[500px] rounded-full bg-brand-red/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-[1200px] right-1/4 h-[400px] w-[400px] rounded-full bg-brand-red/5 blur-[120px] pointer-events-none" />

      {/* Hero Header Presentation */}
      <Hero />

      {/* Quick Search Overlay bar */}
      <Suspense fallback={<div className="h-16 max-w-5xl mx-auto bg-zinc-900 animate-pulse rounded-2xl -mt-8" />}>
        <QuickSearch />
      </Suspense>

      {/* Curated/Featured vehicles grid */}
      <FeaturedVehicles vehicles={featuredVehicles} />

      {/* Interactive Catalog section */}
      <Suspense
        fallback={
          <div className="mx-auto max-w-7xl px-4 py-16 text-center">
            <h3 className="text-zinc-500 animate-pulse uppercase tracking-wider text-xs">Cargando catálogo completo...</h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <VehicleCardSkeleton key={i} />
              ))}
            </div>
          </div>
        }
      >
        <VehicleCatalog initialVehicles={vehicles} />
      </Suspense>

      {/* trust indicators section */}
      <TrustBenefits />

      {/* financing section */}
      <FinancingSection />

      {/* about company section */}
      <AboutSection />

      {/* call to action contact section */}
      <CallToAction />

    </main>
  );
}
