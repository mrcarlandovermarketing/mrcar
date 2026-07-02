"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Car, DollarSign } from 'lucide-react';

export function QuickSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Local state for the quick search form
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [type, setType] = useState(searchParams.get('type') || 'Todos');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || 'Todos');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // Build URL search params dynamically
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (type !== 'Todos') params.set('type', type);
    if (maxPrice !== 'Todos') params.set('maxPrice', maxPrice);

    // Update URL query params
    const queryString = params.toString();
    const targetUrl = queryString ? `/?${queryString}#catalog-section` : '/#catalog-section';
    router.push(targetUrl);

    // Scroll to catalog section smoothly
    setTimeout(() => {
      const catalogEl = document.getElementById('catalog-section');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="w-full relative z-20 -mt-8 px-4 sm:px-6 lg:px-8">
      <form
        onSubmit={handleSearch}
        className="mx-auto max-w-5xl rounded-2xl bg-zinc-900 border border-zinc-800 p-5 shadow-xl shadow-black/40 backdrop-blur-md"
      >
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-12 items-end">
          
          {/* Brand/Model Query */}
          <div className="md:col-span-4">
            <label htmlFor="quick-query" className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Marca o Modelo
            </label>
            <div className="relative">
              <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                id="quick-query"
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Ej. Toyota Corolla..."
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red transition-all"
              />
            </div>
          </div>

          {/* Body Type */}
          <div className="md:col-span-3">
            <label htmlFor="quick-type" className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Tipo de Auto
            </label>
            <div className="relative">
              <Car className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <select
                id="quick-type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 py-3 pl-10 pr-4 text-sm text-zinc-300 focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red transition-all appearance-none cursor-pointer"
              >
                <option value="Todos">Cualquier tipo</option>
                <option value="Sedan">Sedán</option>
                <option value="SUV">SUV</option>
                <option value="Coupe">Cupé</option>
                <option value="Hatchback">Hatchback</option>
              </select>
              {/* Custom select arrow indicator */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 border-l border-zinc-800 pl-2">
                ▼
              </div>
            </div>
          </div>

          {/* Max Price */}
          <div className="md:col-span-3">
            <label htmlFor="quick-price" className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Precio Máximo
            </label>
            <div className="relative">
              <DollarSign className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <select
                id="quick-price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 py-3 pl-10 pr-4 text-sm text-zinc-300 focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red transition-all appearance-none cursor-pointer"
              >
                <option value="Todos">Cualquier precio</option>
                <option value="12000">Hasta $12,000</option>
                <option value="15000">Hasta $15,000</option>
                <option value="18000">Hasta $18,000</option>
                <option value="20000">Hasta $20,000</option>
                <option value="35000">Hasta $35,000</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 border-l border-zinc-800 pl-2">
                ▼
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full rounded-xl bg-brand-red hover:bg-brand-red-hover text-white py-3 px-4 text-sm font-bold transition-all shadow-md shadow-brand-red/10 cursor-pointer active:scale-98"
            >
              Buscar
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}
export default QuickSearch;
