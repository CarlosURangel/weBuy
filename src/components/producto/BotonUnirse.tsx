"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { unirseCompraGrupal } from "@/app/actions/publicaciones"; // Importamos la nueva acción

export default function BotonUnirse({ producto, faltantes }: any) {
  const [cantidad, setCantidad] = useState(1);
  const [isPending, startTransition] = useTransition(); // Hook para manejar el estado de carga

  const incrementar = () => {
    setCantidad(prev => Math.min(faltantes, prev + 1));
  };

  const decrementar = () => {
    setCantidad(prev => Math.max(1, prev - 1));
  };

  const handleJoinBuy = () => {
    // startTransition protege la ejecución asíncrona
    startTransition(async () => {
      // Llamamos a tu base de datos pasándole el ID y la cantidad
      const res = await unirseCompraGrupal(producto.id, cantidad);

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`🎉 ¡Guardado! Te has unido a la compra de '${producto.titulo}' con ${cantidad} unidades.`);
        // Reiniciamos el contador visual a 1 después de una compra exitosa (opcional)
        setCantidad(1); 
      }
    });
  }

  // Desactivamos si ya se cumplió la meta
  const isComplete = faltantes <= 0;

  return (
    <div className="flex gap-3">
      
      {/* Selector de Cantidad */}
      <div className="flex items-center border border-gray-300 rounded-full px-2 bg-gray-50 shadow-inner">
        <button 
          onClick={decrementar} 
          disabled={cantidad <= 1 || isComplete || isPending}
          className="p-3 text-xl text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          −
        </button>
        <span className="text-xl font-bold w-12 text-center text-gray-900 px-1">{cantidad}</span>
        <button 
          onClick={incrementar} 
          disabled={cantidad >= faltantes || isComplete || isPending}
          className="p-3 text-xl text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          +
        </button>
      </div>

      {/* Botón Principal */}
      <button 
        onClick={handleJoinBuy}
        disabled={isComplete || isPending}
        className="w-full bg-[#A855F7] hover:bg-purple-800 text-white font-bold py-4 px-6 rounded-full transition shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed text-lg"
      >
        {isPending ? "Procesando..." : isComplete ? "Meta Cumplida ✅" : "Unirse a la compra grupal"}
      </button>

    </div>
  );
}