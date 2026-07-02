"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Vehicle } from '@/domain/entities/vehicle';
import { VehicleBadge } from './vehicle-badge';
import { formatCurrency, formatMileage, maskVin } from '../utils/formatters';
import { getWhatsAppLink } from '../utils/whatsapp';
import { MessageCircle, Calendar, Gauge, Key, Eye, HelpCircle } from 'lucide-react';

interface VehicleCardProps {
  vehicle: Vehicle;
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const whatsappUrl = getWhatsAppLink(vehicle);
  const [imgSrc, setImgSrc] = useState(vehicle.mainPhoto);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 transition-all duration-300 hover:-translate-y-1 hover:border-zinc-700 hover:shadow-2xl hover:shadow-brand-red/5">
      {/* Badge container on top of photo */}
      <div className="absolute top-4 left-4 z-10">
        <VehicleBadge status={vehicle.status} />
      </div>

      {vehicle.featured && (
        <div className="absolute top-4 right-4 z-10">
          <span className="inline-flex items-center rounded-full bg-brand-red text-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-lg">
            Destacado
          </span>
        </div>
      )}

      {/* Vehicle Image */}
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-800">
        <Image
          src={imgSrc}
          alt={`${vehicle.make} ${vehicle.model}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
          onError={() => setImgSrc('/placeholders/vehicle-placeholder.png')}
        />
        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-85 pointer-events-none" />
        
        {/* Price Tag positioned over image bottom */}
        <div className="absolute bottom-3 left-4 pointer-events-none">
          <p className="text-2xl font-black text-white tracking-tight">
            {formatCurrency(vehicle.price)}
          </p>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2">
          <span className="text-xs font-semibold text-brand-red uppercase tracking-widest">
            {vehicle.make}
          </span>
          <h3 className="text-lg font-bold text-zinc-100 group-hover:text-white transition-colors line-clamp-1">
            {vehicle.model} <span className="text-zinc-400 text-sm font-normal">{vehicle.version}</span>
          </h3>
        </div>

        {/* Technical Specs grid */}
        <div className="my-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-b border-zinc-800/80 py-3.5 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <Calendar className="h-4.5 w-4.5 text-zinc-550" />
            <span>Año: <strong className="text-zinc-200">{vehicle.year}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Gauge className="h-4.5 w-4.5 text-zinc-550" />
            <span>{formatMileage(vehicle.mileage)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Key className="h-4.5 w-4.5 text-zinc-550" />
            <span>VIN: <strong className="text-zinc-200" title={vehicle.vin}>{maskVin(vehicle.vin)}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4.5 w-4.5 text-zinc-550" />
            <span>{vehicle.transmission || 'N/D'}</span>
          </div>
        </div>

        <p className="text-xs text-zinc-500 line-clamp-2 mb-5 leading-relaxed">
          {vehicle.description || 'Sin descripción disponible.'}
        </p>

        {/* Action Buttons */}
        <div className="mt-auto grid grid-cols-2 gap-3">
          <Link
            href={`/vehiculo/${vehicle.slug}`}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-850 px-4 py-2.5 text-xs font-bold text-zinc-200 transition-all hover:bg-zinc-700 hover:text-white"
          >
            <Eye className="h-4 w-4" />
            Detalles
          </Link>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-emerald-500 shadow-md shadow-emerald-950/20"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
export default VehicleCard;
