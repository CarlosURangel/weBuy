"use client";

import { Star } from "lucide-react";

interface ReputationBadgeProps {
  calificacion: number;
  comprasCompletadas: number;
}

export function ReputationBadge({
  calificacion,
  comprasCompletadas,
}: ReputationBadgeProps) {
  const estrellas = Math.round(calificacion);

  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={14}
            className={
              i < estrellas
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }
          />
        ))}
      </div>
      <span className="text-xs font-semibold text-gray-700">
        {calificacion.toFixed(1)} • {comprasCompletadas} compras
      </span>
    </div>
  );
}
