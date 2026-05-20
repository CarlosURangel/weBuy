"use client";

import { useState } from "react";
import { aprobarParticipacion, rechazarParticipacion } from "@/app/actions/participaciones";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

interface PendingRequest {
  id_participacion: number;
  usuario: {
    nombre: string;
    correo: string;
  };
  cantidad: number;
  publicacion: {
    titulo: string;
  };
}

interface RequestsListProps {
  solicitudes: PendingRequest[];
}

export function RequestsList({ solicitudes }: RequestsListProps) {
  const [procesando, setProcesando] = useState<number | null>(null);

  const handleAprobar = async (id: number) => {
    setProcesando(id);
    try {
      const result = await aprobarParticipacion(id);
      if (result.success) {
        toast.success("Participación aprobada");
      } else {
        toast.error(result.error || "Error al aprobar");
      }
    } catch (error) {
      toast.error("Error al aprobar");
    } finally {
      setProcesando(null);
    }
  };

  const handleRechazar = async (id: number) => {
    setProcesando(id);
    try {
      const result = await rechazarParticipacion(id);
      if (result.success) {
        toast.success("Participación rechazada");
      } else {
        toast.error(result.error || "Error al rechazar");
      }
    } catch (error) {
      toast.error("Error al rechazar");
    } finally {
      setProcesando(null);
    }
  };

  if (solicitudes.length === 0) {
    return (
      <div className="flex items-center gap-2 text-gray-500 text-sm">
        <AlertCircle size={16} />
        No hay solicitudes pendientes
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {solicitudes.map((solicitud) => (
        <Card key={solicitud.id_participacion} className="p-4">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-900">
                {solicitud.usuario.nombre}
              </p>
              <p className="text-xs text-gray-500">{solicitud.usuario.correo}</p>
              <p className="text-sm text-gray-600 mt-1">
                Cantidad solicitada: <span className="font-semibold">{solicitud.cantidad}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRechazar(solicitud.id_participacion)}
                disabled={procesando === solicitud.id_participacion}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Rechazar
              </Button>
              <Button
                size="sm"
                onClick={() => handleAprobar(solicitud.id_participacion)}
                disabled={procesando === solicitud.id_participacion}
              >
                Aprobar
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
