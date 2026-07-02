import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createVehicleRepository } from '@/infrastructure/repositories/vehicle-repository-factory';
import { GetVehicleBySlugUseCase } from '@/application/use-cases/get-vehicle-by-slug.use-case';
import { GetVehiclesUseCase } from '@/application/use-cases/get-vehicles.use-case';
import { VehicleCarousel } from '@/presentation/components/vehicle-carousel';
import { VehicleBadge } from '@/presentation/components/vehicle-badge';
import { VehicleCard } from '@/presentation/components/vehicle-card';
import { VehicleActions } from '@/components/vehicles/VehicleActions';
import { formatCurrency, formatMileage, maskVin } from '@/presentation/utils/formatters';
import { 
  ArrowLeft, Calendar, Gauge, Key, Settings, 
  Droplet, Eye, ShieldCheck, MapPin, Hash, Layers,
  ChevronRight, AlertCircle
} from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate dynamic SEO metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const repository = createVehicleRepository();
  const getVehicleBySlug = new GetVehicleBySlugUseCase(repository);
  const vehicle = await getVehicleBySlug.execute(slug);

  if (!vehicle) {
    return {
      title: 'Vehículo no encontrado | Mr. Car',
      description: 'El vehículo solicitado no está disponible o no existe.',
    };
  }

  return {
    title: `${vehicle.make} ${vehicle.model} ${vehicle.year} - Mr. Car Automotive Group`,
    description: `Descubre los detalles técnicos del ${vehicle.make} ${vehicle.model} ${vehicle.year} (${vehicle.version}) en color ${vehicle.exteriorColor}. Importación garantizada en español.`,
    openGraph: {
      title: `${vehicle.make} ${vehicle.model} ${vehicle.year} - Mr. Car`,
      description: vehicle.description,
      images: [{ url: vehicle.mainPhoto }],
    },
  };
}

// Enable static generation for slugs
export async function generateStaticParams() {
  const repository = createVehicleRepository();
  const getVehicles = new GetVehiclesUseCase(repository);
  const vehicles = await getVehicles.execute();
  return vehicles.map((vehicle) => ({
    slug: vehicle.slug,
  }));
}

export default async function VehiclePage({ params }: PageProps) {
  const { slug } = await params;
  const repository = createVehicleRepository();
  const getVehicleBySlug = new GetVehicleBySlugUseCase(repository);
  const vehicle = await getVehicleBySlug.execute(slug);

  if (!vehicle) {
    notFound();
  }

  // Fetch related vehicles (exclude current vehicle, limit to 3)
  const getVehicles = new GetVehiclesUseCase(repository);
  const allActiveVehicles = await getVehicles.execute();
  const relatedVehicles = allActiveVehicles
    .filter((v) => v.id !== vehicle.id)
    .slice(0, 3);

  // JSON-LD Car structured data for Google SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Car',
    'name': `${vehicle.make} ${vehicle.model} ${vehicle.year}`,
    'image': vehicle.photos.length > 0 ? vehicle.photos : [vehicle.mainPhoto],
    'description': vehicle.description,
    'brand': {
      '@type': 'Brand',
      'name': vehicle.make
    },
    'model': vehicle.model,
    'vehicleModelDate': vehicle.year,
    'vehicleIdentificationNumber': vehicle.vin,
    'color': vehicle.exteriorColor,
    'vehicleTransmission': vehicle.transmission,
    'fuelType': vehicle.fuel,
    'numberOfDoors': vehicle.doors,
    'offers': {
      '@type': 'Offer',
      'priceCurrency': 'USD',
      'price': vehicle.price,
      'availability': vehicle.status === 'Disponible' 
        ? 'https://schema.org/InStock' 
        : vehicle.status === 'Reservado' 
          ? 'https://schema.org/LimitedAvailability' 
          : 'https://schema.org/SoldOut'
    },
    'mileageFromOdometer': {
      '@type': 'QuantitativeValue',
      'value': vehicle.mileage,
      'unitCode': 'SMI'
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-brand-red selection:text-white py-8">
      
      {/* JSON-LD Script tag injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-zinc-550" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-white transition-colors">
            Inicio
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/#catalog-section" className="hover:text-white transition-colors">
            Inventario
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-zinc-350 font-medium truncate max-w-[200px] sm:max-w-none">
            {vehicle.make} {vehicle.model} {vehicle.year}
          </span>
        </nav>

        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/#catalog-section"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-semibold group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Volver al inventario completo
          </Link>
        </div>

        {/* Status Alert Banner */}
        {vehicle.status === 'Vendido' && (
          <div className="mb-8 rounded-2xl bg-rose-500/10 border border-rose-500/25 p-4 flex gap-3 text-left items-start">
            <AlertCircle className="h-5.5 w-5.5 text-rose-450 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Vehículo no disponible (Vendido)</h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Este auto ha sido vendido recientemente a un cliente. Puedes navegar por nuestro inventario para ver opciones de importación similares.
              </p>
            </div>
          </div>
        )}

        {vehicle.status === 'Reservado' && (
          <div className="mb-8 rounded-2xl bg-amber-500/10 border border-amber-500/25 p-4 flex gap-3 text-left items-start">
            <AlertCircle className="h-5.5 w-5.5 text-amber-450 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Vehículo Reservado</h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Este vehículo cuenta con una reserva activa de un cliente. Sin embargo, puedes solicitar información por si el estado cambia o si buscas importar un modelo idéntico.
              </p>
            </div>
          </div>
        )}

        {/* Main Grid Details layout */}
        <div className="grid gap-8 lg:grid-cols-12">
          
          {/* Left Column: Carousel, Description & Features */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Carousel slider */}
            <VehicleCarousel
              photos={vehicle.photos}
              mainPhoto={vehicle.mainPhoto}
              altText={`${vehicle.make} ${vehicle.model} ${vehicle.year}`}
            />

            {/* Description card */}
            <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6">
              <h2 className="text-lg font-bold text-white mb-4">Descripción</h2>
              <p className="text-zinc-350 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                {vehicle.description || 'Sin descripción disponible.'}
              </p>
            </div>

            {/* Features chips */}
            {vehicle.features.length > 0 && (
              <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6">
                <h2 className="text-lg font-bold text-white mb-4">Características Destacadas</h2>
                <div className="flex flex-wrap gap-2.5">
                  {vehicle.features.map((feature, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center rounded-xl bg-zinc-950 border border-zinc-850 px-3.5 py-2 text-xs font-semibold text-zinc-300 transition-colors hover:border-zinc-700"
                    >
                      <ShieldCheck className="h-4 w-4 text-brand-red mr-2 flex-shrink-0" />
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sticky specs sidebar & actions */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Purchase & Action Box */}
            <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-xl relative overflow-hidden h-fit lg:sticky lg:top-24">
              
              {/* Decorative light */}
              <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-brand-red/5 blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between gap-4 mb-4">
                <span className="text-xs font-bold text-brand-red uppercase tracking-widest">
                  {vehicle.make}
                </span>
                <VehicleBadge status={vehicle.status} />
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {vehicle.model}
              </h1>
              <p className="text-zinc-450 text-xs mt-1">{vehicle.version}</p>

              <div className="mt-6 border-t border-b border-zinc-850 py-5">
                <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold">Precio estimado de importación</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-extrabold text-white tracking-tight">
                    {formatCurrency(vehicle.price)}
                  </span>
                  <span className="text-xs font-bold text-zinc-450">USD</span>
                </div>
                <p className="text-zinc-550 text-[10px] mt-2 flex items-center gap-1.5 leading-normal">
                  * Este es un precio aproximado que cubre el valor en origen, la subasta y la logística básica de exportación.
                </p>
              </div>

              {/* Client Action Interactive panel */}
              <div className="mt-6">
                <VehicleActions vehicle={vehicle} />
              </div>
            </div>

            {/* Tech Specs sheet */}
            <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6">
              <h2 className="text-lg font-bold text-white mb-4">Ficha Técnica</h2>
              
              <div className="flex flex-col gap-3.5 text-xs">
                
                <div className="flex justify-between items-center border-b border-zinc-850 pb-2.5">
                  <span className="text-zinc-450 flex items-center gap-2.5">
                    <Calendar className="h-4.5 w-4.5 text-zinc-550" />
                    Año
                  </span>
                  <span className="font-bold text-zinc-200">{vehicle.year}</span>
                </div>

                <div className="flex justify-between items-center border-b border-zinc-850 pb-2.5">
                  <span className="text-zinc-450 flex items-center gap-2.5">
                    <Gauge className="h-4.5 w-4.5 text-zinc-550" />
                    Millaje
                  </span>
                  <span className="font-bold text-zinc-200">{formatMileage(vehicle.mileage)}</span>
                </div>

                <div className="flex justify-between items-center border-b border-zinc-850 pb-2.5">
                  <span className="text-zinc-450 flex items-center gap-2.5">
                    <Settings className="h-4.5 w-4.5 text-zinc-550" />
                    Transmisión
                  </span>
                  <span className="font-bold text-zinc-200">{vehicle.transmission || 'N/D'}</span>
                </div>

                <div className="flex justify-between items-center border-b border-zinc-850 pb-2.5">
                  <span className="text-zinc-450 flex items-center gap-2.5">
                    <Droplet className="h-4.5 w-4.5 text-zinc-550" />
                    Combustible
                  </span>
                  <span className="font-bold text-zinc-200">{vehicle.fuel || 'N/D'}</span>
                </div>

                <div className="flex justify-between items-center border-b border-zinc-850 pb-2.5">
                  <span className="text-zinc-450 flex items-center gap-2.5">
                    <Layers className="h-4.5 w-4.5 text-zinc-550" />
                    Tracción
                  </span>
                  <span className="font-bold text-zinc-200">{vehicle.drivetrain || 'N/D'}</span>
                </div>

                <div className="flex justify-between items-center border-b border-zinc-850 pb-2.5">
                  <span className="text-zinc-450 flex items-center gap-2.5">
                    <Eye className="h-4.5 w-4.5 text-zinc-550" />
                    Motor
                  </span>
                  <span className="font-bold text-zinc-200">{vehicle.engine || 'N/D'}</span>
                </div>

                <div className="flex justify-between items-center border-b border-zinc-850 pb-2.5">
                  <span className="text-zinc-450 flex items-center gap-2.5">
                    <MapPin className="h-4.5 w-4.5 text-zinc-550" />
                    Ubicación
                  </span>
                  <span className="font-bold text-zinc-200">{vehicle.city || 'N/D'}, {vehicle.state || 'N/D'}</span>
                </div>

                <div className="flex justify-between items-center border-b border-zinc-850 pb-2.5">
                  <span className="text-zinc-450 flex items-center gap-2.5">
                    <Hash className="h-4.5 w-4.5 text-zinc-550" />
                    Número de Puertas
                  </span>
                  <span className="font-bold text-zinc-200">{vehicle.doors}</span>
                </div>

                <div className="flex justify-between items-center pb-2.5 border-b border-zinc-850">
                  <span className="text-zinc-450 flex items-center gap-2.5">
                    <Key className="h-4.5 w-4.5 text-zinc-550" />
                    VIN Enmascarado
                  </span>
                  <span className="font-bold text-zinc-200 font-mono tracking-wider bg-zinc-950 px-2 py-1 rounded border border-zinc-850">
                    {maskVin(vehicle.vin)}
                  </span>
                </div>

                {vehicle.stockNumber && (
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-zinc-455 flex items-center gap-2.5">
                      <Hash className="h-4.5 w-4.5 text-zinc-550" />
                      Stock Number
                    </span>
                    <span className="font-bold text-zinc-200 font-mono">
                      {vehicle.stockNumber}
                    </span>
                  </div>
                )}

              </div>
            </div>
          </div>

        </div>

        {/* Related Vehicles section */}
        {relatedVehicles.length > 0 && (
          <div className="mt-16 border-t border-zinc-900 pt-12">
            <h2 className="text-2xl font-black text-white tracking-tight mb-2">
              Vehículos Relacionados
            </h2>
            <p className="text-zinc-500 text-xs mb-8">
              Otras opciones activas en nuestro inventario que podrían interesarte.
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedVehicles.map((related) => (
                <VehicleCard key={related.id} vehicle={related} />
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
