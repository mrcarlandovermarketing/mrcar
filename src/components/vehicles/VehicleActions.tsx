"use client";

import React, { useState } from 'react';
import { MessageCircle, Share2, ClipboardCheck } from 'lucide-react';
import { Vehicle } from '@/domain/entities/vehicle';
import { getWhatsAppLink } from '@/presentation/utils/whatsapp';
import { formatCurrency } from '@/presentation/utils/formatters';

interface VehicleActionsProps {
  vehicle: Vehicle;
}

export function VehicleActions({ vehicle }: VehicleActionsProps) {
  const [copied, setCopied] = useState(false);
  const whatsappUrl = getWhatsAppLink(vehicle);

  const handleShare = async () => {
    const pageUrl = window.location.href;
    const shareData = {
      title: `${vehicle.make} ${vehicle.model} ${vehicle.year} - Mr. Car`,
      text: vehicle.price !== null && vehicle.price !== undefined
        ? `Mira este ${vehicle.make} ${vehicle.model} ${vehicle.year} por ${formatCurrency(vehicle.price)} en Mr. Car.`
        : `Mira este ${vehicle.make} ${vehicle.model} ${vehicle.year} en Mr. Car.`,
      url: pageUrl,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.warn('Native share failed or cancelled:', err);
      }
    } else {
      // Fallback to copy link
      try {
        await navigator.clipboard.writeText(pageUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Clipboard copy failed:', err);
      }
    }
  };

  return (
    <div className="w-full flex flex-col gap-3">
      
      {/* Action Buttons Desk */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-4 text-xs transition-all shadow-md shadow-emerald-950/20 cursor-pointer active:scale-98"
        >
          <MessageCircle className="h-5 w-5" />
          Consultar por WhatsApp
        </a>
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2.5 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 hover:text-white font-bold py-3.5 px-4 text-xs transition-all cursor-pointer"
        >
          {copied ? (
            <>
              <ClipboardCheck className="h-4.5 w-4.5 text-emerald-400" />
              ¡Enlace Copiado!
            </>
          ) : (
            <>
              <Share2 className="h-4.5 w-4.5" />
              Compartir Auto
            </>
          )}
        </button>
      </div>

      {/* Sticky Bottom Bar on Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-zinc-950/95 border-t border-zinc-850 p-4 backdrop-blur-md shadow-xl flex items-center justify-between gap-3 animate-fadeInUp">
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500 font-semibold uppercase">Importación Mr. Car</span>
          <span className="text-base font-extrabold text-white">{formatCurrency(vehicle.price)}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white focus:outline-none"
            title="Compartir"
          >
            {copied ? <ClipboardCheck className="h-5 w-5 text-emerald-400" /> : <Share2 className="h-5 w-5" />}
          </button>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white transition-all hover:bg-emerald-500 shadow-lg shadow-emerald-950/20"
          >
            <MessageCircle className="h-5 w-5" />
            Preguntar
          </a>
        </div>
      </div>

      {/* Add CSS margin utility style injected on viewport to prevent overlap on mobile */}
      <style jsx global>{`
        @media (max-width: 768px) {
          body {
            padding-bottom: 80px; /* offset the mobile bottom bar */
          }
        }
      `}</style>

    </div>
  );
}
export default VehicleActions;
