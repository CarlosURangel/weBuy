"use client";

import { useState } from "react";
import { solicitarUnirse } from "@/app/actions/participaciones";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface JoinOrderButtonProps {
  publicacionId: number;
  esCreador: boolean;
  yaUnido: boolean;
  estadoParticipacion?: string;
  unidadesFaltantes?: number;
}

export function JoinOrderButton({
  publicacionId,
  esCreador,
  yaUnido,
  estadoParticipacion,
  unidadesFaltantes = 1,
}: JoinOrderButtonProps) {
  const [cantidad, setCantidad] = useState("1");
  const [loading, setLoading] = useState(false);

  if (esCreador) {
    return (
      <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
        Tú eres el creador de esta compra
      </div>
    );
  }

  if (yaUnido) {
    let statusText = "Solicitud pendiente";
    let statusColor = "text-yellow-600";

    if (estadoParticipacion === "APPROVED") {
      statusText = "Aprobado";
      statusColor = "text-green-600";
    } else if (estadoParticipacion === "REJECTED") {
      statusText = "Rechazado";
      statusColor = "text-red-600";
    }

    return (
      <div className={`px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium ${statusColor}`}>
        {statusText}
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "") {
      setCantidad("");
      return;
    }
    const value = parseInt(raw);
    if (isNaN(value) || value < 1) {
      setCantidad("1");
      return;
    }
    setCantidad(Math.min(value, unidadesFaltantes).toString());
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cantidadNum = parseInt(cantidad);
    if (isNaN(cantidadNum) || cantidadNum < 1) {
      toast.error("La cantidad debe ser al menos 1");
      return;
    }
    if (cantidadNum > unidadesFaltantes) {
      toast.error(`Máximo puedes solicitar ${unidadesFaltantes} unidades`);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("publicacion_id", publicacionId.toString());
      formData.append("cantidad", cantidad);

      const result = await solicitarUnirse(formData);

      if (result.success) {
        toast.success("Solicitud enviada correctamente");
        setCantidad("1");
      } else {
        toast.error(result.error || "Error al enviar solicitud");
      }
    } catch (error) {
      toast.error("Error al enviar solicitud");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <Input
          type="number"
          min="1"
          max={unidadesFaltantes}
          value={cantidad}
          onChange={handleChange}
          placeholder={`1-${unidadesFaltantes}`}
          className="w-20"
        />
        <Button
          type="submit"
          disabled={loading}
          className="flex-1"
        >
          {loading ? "Enviando..." : "Solicitar unirse"}
        </Button>
      </div>
      <p className="text-xs text-gray-500">
        Máximo {unidadesFaltantes} unidades disponibles
      </p>
    </form>
  );
}
