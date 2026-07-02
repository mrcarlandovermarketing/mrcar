import React from 'react';
import { VehicleStatus } from '@/domain/entities/vehicle';

interface VehicleBadgeProps {
  status: VehicleStatus;
  className?: string;
}

export function VehicleBadge({ status, className = '' }: VehicleBadgeProps) {
  if (status === 'Oculto') return null;

  const styles = {
    Disponible: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25',
    Reservado: 'bg-amber-500/10 text-amber-400 border border-amber-500/25',
    Vendido: 'bg-rose-500/10 text-rose-400 border border-rose-500/25',
  };

  const labels = {
    Disponible: 'Disponible',
    Reservado: 'Reservado',
    Vendido: 'Vendido',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm ${styles[status as keyof typeof styles]} ${className}`}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {labels[status as keyof typeof labels] || status}
    </span>
  );
}
