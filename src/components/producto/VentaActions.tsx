"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { finalizarVenta, cancelarPublicacion } from "@/app/actions/publicaciones";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface VentaActionsProps {
  publicacionId: number;
}

export function FinalizarVentaButton({ publicacionId }: VentaActionsProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleFinalizar = async () => {
    if (!confirm("¿Estás seguro de finalizar esta venta? Se marcará como completada y se incrementarán las compras completadas de todos los participantes.")) return;
    setLoading(true);
    const result = await finalizarVenta(publicacionId);
    if (result.success) {
      toast.success("Venta finalizada correctamente");
      router.refresh();
    } else {
      toast.error(result.error || "Error al finalizar venta");
    }
    setLoading(false);
  };

  return (
    <Button onClick={handleFinalizar} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white w-full">
      {loading ? "Finalizando..." : "Finalizar Venta"}
    </Button>
  );
}

export function CancelarVentaButton({ publicacionId }: VentaActionsProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCancelar = async () => {
    if (!confirm("¿Estás seguro de cancelar esta venta? Los participantes serán notificados.")) return;
    setLoading(true);
    const result = await cancelarPublicacion(publicacionId);
    if (result.success) {
      toast.success("Venta cancelada");
      router.refresh();
    } else {
      toast.error(result.error || "Error al cancelar venta");
    }
    setLoading(false);
  };

  return (
    <Button onClick={handleCancelar} disabled={loading} variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
      {loading ? "Cancelando..." : "Cancelar Venta"}
    </Button>
  );
}
