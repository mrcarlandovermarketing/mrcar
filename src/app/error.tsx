"use client";

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console or error report service
    console.error('Next.js Page Error caught:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-zinc-950 text-zinc-350 px-4 py-16 text-center select-none">
      
      {/* Background glow in red */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-brand-red/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-md flex flex-col items-center">
        
        {/* Error icon */}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-brand-red mb-6 shadow-xl shadow-brand-red/5">
          <AlertTriangle className="h-8 w-8 animate-pulse" />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-brand-red">
          Error del Sistema
        </span>

        <h1 className="text-3xl font-black text-white mt-2 tracking-tight sm:text-4xl">
          Algo no salió como esperábamos
        </h1>

        <p className="mt-3 text-sm text-zinc-550 leading-relaxed">
          Ha ocurrido un problema al cargar esta sección. No te preocupes, el resto del sitio sigue operativo. Puedes reintentar la acción o volver al inicio.
        </p>

        {/* Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-red hover:bg-brand-red-hover text-white px-5 py-3 text-xs font-bold transition-all shadow-md shadow-brand-red/10 cursor-pointer active:scale-98"
          >
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-350 hover:text-white px-5 py-3 text-xs font-bold transition-all cursor-pointer"
          >
            <Home className="h-4 w-4" />
            Ir a Inicio
          </Link>
        </div>

      </div>
    </div>
  );
}
