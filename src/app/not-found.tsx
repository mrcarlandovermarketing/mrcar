import React from 'react';
import Link from 'next/link';
import { Car, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-zinc-950 text-zinc-350 px-4 py-16 text-center select-none">
      
      {/* Visual Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-brand-red/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-md flex flex-col items-center">
        
        {/* Icon */}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-brand-red mb-6 shadow-xl shadow-brand-red/5">
          <Car className="h-8 w-8 animate-bounce" />
        </div>

        {/* Error Code */}
        <span className="text-xs font-bold uppercase tracking-widest text-brand-red">
          Error 404
        </span>

        {/* Heading */}
        <h1 className="text-3xl font-black text-white mt-2 tracking-tight sm:text-4xl">
          Vehículo o Ruta No Encontrados
        </h1>

        {/* Description */}
        <p className="mt-3 text-sm text-zinc-500 leading-relaxed">
          Lo sentimos, el vehículo que buscas ya no está disponible, fue reservado o la página ingresada no existe en nuestro catálogo.
        </p>

        {/* Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-red hover:bg-brand-red-hover text-white px-5 py-3 text-xs font-bold transition-all shadow-md shadow-brand-red/10 cursor-pointer"
          >
            <Home className="h-4 w-4" />
            Volver al Inicio
          </Link>
          <Link
            href="/#catalog-section"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-350 hover:text-white px-5 py-3 text-xs font-bold transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Ver Inventario
          </Link>
        </div>

      </div>
    </div>
  );
}
