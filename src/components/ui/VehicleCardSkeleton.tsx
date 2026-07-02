import React from 'react';

export function VehicleCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 animate-pulse">
      
      {/* Image Placeholder */}
      <div className="relative aspect-video w-full bg-zinc-800" />

      {/* Card Content Placeholder */}
      <div className="flex flex-1 flex-col p-5 space-y-4">
        
        {/* Brand & Model */}
        <div className="space-y-2">
          <div className="h-3 w-16 rounded bg-zinc-800" />
          <div className="h-5 w-3/4 rounded bg-zinc-800" />
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-3 border-t border-b border-zinc-850 py-3">
          <div className="h-4 rounded bg-zinc-800 w-2/3" />
          <div className="h-4 rounded bg-zinc-800 w-1/2" />
          <div className="h-4 rounded bg-zinc-800 w-1/2" />
          <div className="h-4 rounded bg-zinc-800 w-2/3" />
        </div>

        {/* Description */}
        <div className="space-y-1.5 pt-2">
          <div className="h-3 rounded bg-zinc-800" />
          <div className="h-3 rounded bg-zinc-800 w-5/6" />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-3">
          <div className="h-10 rounded-xl bg-zinc-800" />
          <div className="h-10 rounded-xl bg-zinc-800" />
        </div>

      </div>
    </div>
  );
}
export default VehicleCardSkeleton;
