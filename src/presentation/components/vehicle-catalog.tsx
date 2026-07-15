"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Vehicle } from '@/domain/entities/vehicle';
import { VehicleCard } from './vehicle-card';
import { 
  Search, SlidersHorizontal, RotateCcw, Car, X, 
  ArrowUpDown, Filter 
} from 'lucide-react';

interface VehicleCatalogProps {
  initialVehicles: Vehicle[];
}

export function VehicleCatalog({ initialVehicles }: VehicleCatalogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Mobile drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Read initial states from URL search params
  const qParam = searchParams.get('q') || '';
  const brandParam = searchParams.get('brand') || 'Todos';
  const typeParam = searchParams.get('type') || 'Todos';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const minYearParam = searchParams.get('minYear') || '';
  const maxYearParam = searchParams.get('maxYear') || '';
  const maxMileageParam = searchParams.get('maxMileage') || '';
  const transParam = searchParams.get('transmission') || 'Todos';
  const fuelParam = searchParams.get('fuel') || 'Todos';
  const statusParam = searchParams.get('status') || 'Todos';
  const featuredParam = searchParams.get('featured') === 'true';
  const sortParam = searchParams.get('sort') || 'featured';

  // Helper to sync parameters with the URL
  const updateUrl = (updates: Record<string, string | null>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || value === 'Todos') {
        current.delete(key);
      } else {
        current.set(key, value);
      }
    });

    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.replace(`${pathname}${query}#catalog-section`, { scroll: false });
  };

  // Sync state with URL change
  const [searchQuery, setSearchQuery] = useState(qParam);
  const [prevQParam, setPrevQParam] = useState(qParam);

  if (qParam !== prevQParam) {
    setPrevQParam(qParam);
    setSearchQuery(qParam);
  }

  // Extract unique brands dynamically (representing MARCA -> make)
  const uniqueBrands = useMemo(() => {
    const brands = initialVehicles.map((v) => v.make);
    return Array.from(new Set(brands)).sort();
  }, [initialVehicles]);

  // Handle escape key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDrawerOpen(false);
      }
    };
    if (isDrawerOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isDrawerOpen]);

  // Click outside drawer to close
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
      setIsDrawerOpen(false);
    }
  };

  // Filtered and sorted vehicles
  const processedVehicles = useMemo(() => {
    let result = [...initialVehicles];

    // 1. Text search
    if (qParam.trim()) {
      const term = qParam.toLowerCase().trim();
      result = result.filter(
        (v) =>
          v.make.toLowerCase().includes(term) ||
          v.model.toLowerCase().includes(term) ||
          v.version.toLowerCase().includes(term) ||
          v.description.toLowerCase().includes(term) ||
          v.vin.toLowerCase().includes(term)
      );
    }

    // 2. Brand (make)
    if (brandParam !== 'Todos') {
      result = result.filter((v) => v.make.toLowerCase() === brandParam.toLowerCase());
    }

    // 3. Body type (Sedan, SUV, Coupe, Hatchback)
    if (typeParam !== 'Todos') {
      const typeLower = typeParam.toLowerCase();
      result = result.filter((v) => {
        const specsText = `${v.model} ${v.version} ${v.description} ${v.vehicleType}`.toLowerCase();
        return specsText.includes(typeLower);
      });
    }

    // 4. Price range
    if (minPriceParam) {
      result = result.filter((v) => v.price !== null && v.price >= parseFloat(minPriceParam));
    }
    if (maxPriceParam) {
      result = result.filter((v) => v.price !== null && v.price <= parseFloat(maxPriceParam));
    }

    // 5. Year range
    if (minYearParam) {
      result = result.filter((v) => v.year >= parseInt(minYearParam));
    }
    if (maxYearParam) {
      result = result.filter((v) => v.year <= parseInt(maxYearParam));
    }

    // 6. Max Mileage
    if (maxMileageParam) {
      result = result.filter((v) => v.mileage <= parseFloat(maxMileageParam));
    }

    // 7. Transmission
    if (transParam !== 'Todos') {
      result = result.filter((v) => v.transmission.toLowerCase().includes(transParam.toLowerCase()));
    }

    // 8. Fuel type (fuel)
    if (fuelParam !== 'Todos') {
      result = result.filter((v) => v.fuel.toLowerCase().includes(fuelParam.toLowerCase()));
    }

    // 9. Status
    if (statusParam !== 'Todos') {
      result = result.filter((v) => v.status === statusParam);
    }

    // 10. Only featured
    if (featuredParam) {
      result = result.filter((v) => v.featured);
    }

    // 11. Sorting
    result.sort((a, b) => {
      switch (sortParam) {
        case 'price_asc':
          if (a.price === null && b.price === null) return 0;
          if (a.price === null) return 1;
          if (b.price === null) return -1;
          return a.price - b.price;
        case 'price_desc':
          if (a.price === null && b.price === null) return 0;
          if (a.price === null) return 1;
          if (b.price === null) return -1;
          return b.price - a.price;
        case 'year_desc':
          return b.year - a.year;
        case 'mileage_asc':
          return a.mileage - b.mileage;
        case 'featured':
        default:
          // Featured first, then order, then publication date descending
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          
          if (a.order !== null && b.order !== null) {
            return a.order - b.order;
          }
          if (a.order !== null && b.order === null) return -1;
          if (a.order === null && b.order !== null) return 1;
          
          return b.publicationDate.getTime() - a.publicationDate.getTime();
      }
    });

    return result;
  }, [
    initialVehicles, qParam, brandParam, typeParam, minPriceParam, 
    maxPriceParam, minYearParam, maxYearParam, maxMileageParam, 
    transParam, fuelParam, statusParam, featuredParam, sortParam
  ]);

  const handleResetFilters = () => {
    setSearchQuery('');
    router.replace(`${pathname}#catalog-section`, { scroll: false });
  };

  // Filter content rendering (Sidebar & Mobile Drawer)
  const renderFiltersContent = () => (
    <div className="flex flex-col gap-6">
      
      {/* Brand (Make) Filter */}
      <div>
        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2.5">
          Marca
        </label>
        <select
          value={brandParam}
          onChange={(e) => updateUrl({ brand: e.target.value })}
          className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-xs text-zinc-200 focus:border-brand-red focus:outline-none cursor-pointer"
        >
          <option value="Todos">Todas las marcas</option>
          {uniqueBrands.map((brand) => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
        </select>
      </div>

      {/* Body Type */}
      <div>
        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2.5">
          Tipo de Vehículo
        </label>
        <select
          value={typeParam}
          onChange={(e) => updateUrl({ type: e.target.value })}
          className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-xs text-zinc-200 focus:border-brand-red focus:outline-none cursor-pointer"
        >
          <option value="Todos">Todos los tipos</option>
          <option value="Sedan">Sedán</option>
          <option value="SUV">SUV</option>
          <option value="Coupe">Cupé</option>
          <option value="Hatchback">Hatchback</option>
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2.5">
          Precio (USD)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPriceParam}
            onChange={(e) => updateUrl({ minPrice: e.target.value })}
            className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-xs text-white placeholder-zinc-650 focus:border-brand-red focus:outline-none"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxPriceParam}
            onChange={(e) => updateUrl({ maxPrice: e.target.value })}
            className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-xs text-white placeholder-zinc-650 focus:border-brand-red focus:outline-none"
          />
        </div>
      </div>

      {/* Year Range */}
      <div>
        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2.5">
          Año
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minYearParam}
            onChange={(e) => updateUrl({ minYear: e.target.value })}
            className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-xs text-white placeholder-zinc-650 focus:border-brand-red focus:outline-none"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxYearParam}
            onChange={(e) => updateUrl({ maxYear: e.target.value })}
            className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-xs text-white placeholder-zinc-650 focus:border-brand-red focus:outline-none"
          />
        </div>
      </div>

      {/* Max Mileage */}
      <div>
        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2.5">
          Millaje Máximo
        </label>
        <input
          type="number"
          placeholder="Ej. 80000"
          value={maxMileageParam}
          onChange={(e) => updateUrl({ maxMileage: e.target.value })}
          className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-xs text-white placeholder-zinc-655 focus:border-brand-red focus:outline-none"
        />
      </div>

      {/* Transmission */}
      <div>
        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2.5">
          Transmisión
        </label>
        <select
          value={transParam}
          onChange={(e) => updateUrl({ transmission: e.target.value })}
          className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-xs text-zinc-200 focus:border-brand-red focus:outline-none cursor-pointer"
        >
          <option value="Todos">Todas</option>
          <option value="Automática">Automática</option>
          <option value="Manual">Manual</option>
        </select>
      </div>

      {/* Fuel Type */}
      <div>
        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2.5">
          Combustible
        </label>
        <select
          value={fuelParam}
          onChange={(e) => updateUrl({ fuel: e.target.value })}
          className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-xs text-zinc-200 focus:border-brand-red focus:outline-none cursor-pointer"
        >
          <option value="Todos">Todos</option>
          <option value="Gasolina">Gasolina</option>
          <option value="Diésel">Diésel</option>
          <option value="Híbrido">Híbrido</option>
          <option value="Eléctrico">Eléctrico</option>
        </select>
      </div>

      {/* Inventory Status */}
      <div>
        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2.5">
          Estado de Inventario
        </label>
        <select
          value={statusParam}
          onChange={(e) => updateUrl({ status: e.target.value })}
          className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-xs text-zinc-200 focus:border-brand-red focus:outline-none cursor-pointer"
        >
          <option value="Todos">Todos los estados</option>
          <option value="Disponible">Disponible</option>
          <option value="Reservado">Reservado</option>
          <option value="Vendido">Vendido</option>
        </select>
      </div>

      {/* Featured checkbox */}
      <div className="flex items-center gap-3 mt-2">
        <input
          id="chk-featured"
          type="checkbox"
          checked={featuredParam}
          onChange={(e) => updateUrl({ featured: e.target.checked ? 'true' : null })}
          className="h-4 w-4 rounded border-zinc-850 bg-zinc-950 text-brand-red focus:ring-brand-red cursor-pointer"
        />
        <label htmlFor="chk-featured" className="text-xs font-bold text-zinc-300 uppercase tracking-widest cursor-pointer select-none">
          Solo Destacados
        </label>
      </div>

      {/* Reset button inside filters */}
      <button
        onClick={handleResetFilters}
        className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 text-xs font-bold py-3 text-zinc-400 hover:text-white transition-all cursor-pointer"
      >
        <RotateCcw className="h-4 w-4" />
        Limpiar Filtros
      </button>

    </div>
  );

  return (
    <section id="catalog-section" className="w-full py-16 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-10 text-center md:text-left md:flex md:items-end md:justify-between border-b border-zinc-900 pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-red">
              Catálogo
            </span>
            <h2 className="text-3xl font-black text-white tracking-tight mt-1 sm:text-4xl">
              Encuentra tu Vehículo Ideal
            </h2>
            <p className="mt-2 text-zinc-400 text-sm max-w-md">
              Explora nuestro inventario en tiempo real y solicita información del vehículo que prefieras.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center justify-center md:justify-end gap-3 text-xs text-zinc-500">
            <span>Resultados:</span>
            <span className="rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-1.5 font-bold text-white">
              {processedVehicles.length} {processedVehicles.length === 1 ? 'Vehículo' : 'Vehículos'}
            </span>
          </div>
        </div>

        {/* Toolbar row */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          
          {/* Main search input */}
          <div className="relative flex-grow max-w-lg">
            <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar por marca, modelo, versión o VIN..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                updateUrl({ q: e.target.value || null });
              }}
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-500 focus:border-brand-red focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  updateUrl({ q: null });
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-550 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Controls button / Sort selection */}
          <div className="flex items-center gap-3 justify-between sm:justify-end">
            
            {/* Mobile Filters trigger button */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="md:hidden flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-700 transition-all cursor-pointer"
            >
              <Filter className="h-4 w-4 text-brand-red" />
              Filtros
            </button>

            {/* Sort Selection dropdown */}
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1">
              <ArrowUpDown className="h-4 w-4 text-zinc-500" />
              <select
                value={sortParam}
                onChange={(e) => updateUrl({ sort: e.target.value })}
                className="bg-transparent border-none py-1.5 pr-6 text-xs text-zinc-350 focus:outline-none cursor-pointer"
              >
                <option value="featured">Destacados Primero</option>
                <option value="price_asc">Precio: Menor a Mayor</option>
                <option value="price_desc">Precio: Mayor a Menor</option>
                <option value="year_desc">Año: Más Reciente</option>
                <option value="mileage_asc">Menor Millaje</option>
              </select>
            </div>

          </div>
        </div>

        {/* Catalog Main Layout */}
        <div className="grid gap-8 md:grid-cols-4">
          
          {/* Left Column: Desktop Filters Panel */}
          <aside className="hidden md:block md:col-span-1 rounded-2xl bg-zinc-900/40 border border-zinc-850 p-5 h-fit sticky top-24 max-h-[85vh] overflow-y-auto">
            <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2">
              <SlidersHorizontal className="h-4.5 w-4.5 text-brand-red" />
              Filtros
            </h3>
            {renderFiltersContent()}
          </aside>

          {/* Right Column: Cards Grid */}
          <main className="md:col-span-3">
            {processedVehicles.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {processedVehicles.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-850 py-20 text-center bg-zinc-900/10">
                <Car className="h-14 w-14 text-zinc-750 mb-4" />
                <h3 className="text-xl font-bold text-zinc-300">No se encontraron resultados</h3>
                <p className="text-zinc-500 text-sm mt-1 max-w-sm">
                  Ningún vehículo coincide con los filtros aplicados. Intenta modificándolos o restableciendo la búsqueda.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-red hover:bg-brand-red-hover text-white px-5 py-3 text-xs font-bold transition-all shadow-md shadow-brand-red/10 cursor-pointer"
                >
                  Restablecer todo
                </button>
              </div>
            )}
          </main>

        </div>
      </div>

      {/* Mobile Drawer (Filters Panel Overlay) */}
      <div
        className={`fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleOverlayClick}
      >
        <div
          ref={drawerRef}
          className={`w-full max-w-xs h-full bg-zinc-900 border-l border-zinc-800 p-6 flex flex-col justify-between transition-transform duration-300 ${
            isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-zinc-850 pb-4 mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <SlidersHorizontal className="h-4.5 w-4.5 text-brand-red" />
              Filtros
            </h3>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-450 hover:text-white"
              aria-label="Cerrar filtros"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto pr-1">
            {renderFiltersContent()}
          </div>
        </div>
      </div>

    </section>
  );
}
export default VehicleCatalog;
