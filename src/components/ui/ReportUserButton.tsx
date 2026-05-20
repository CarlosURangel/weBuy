"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Flag } from "lucide-react";
import { crearReporte } from "@/app/actions/reputacion";

interface ReportUserButtonProps {
  usuarioId: number;
  usuarioNombre: string;
}

const motivos = [
  { value: "FRAUDE", label: "Fraude" },
  { value: "SPAM", label: "Spam" },
  { value: "COMPORTAMIENTO_INAPROPIADO", label: "Comportamiento inapropiado" },
  { value: "OTRO", label: "Otro" },
];

export function ReportUserButton({ usuarioId, usuarioNombre }: ReportUserButtonProps) {
  const [abierto, setAbierto] = useState(false);
  const [razon, setRazon] = useState("FRAUDE");
  const [descripcion, setDescripcion] = useState("");
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    try {
      const formData = new FormData();
      formData.append("reportado_id", usuarioId.toString());
      formData.append("razon", razon);
      formData.append("descripcion", descripcion);

      const result = await crearReporte(formData);
      if (result.success) {
        toast.success(result.message || "Reporte enviado");
        setAbierto(false);
        setDescripcion("");
      } else {
        toast.error(result.error || "Error al enviar reporte");
      }
    } catch {
      toast.error("Error al enviar reporte");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors"
        title="Reportar usuario"
      >
        <Flag className="w-3.5 h-3.5" />
        Reportar
      </button>

      {abierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Reportar a {usuarioNombre}</h3>
            <p className="text-sm text-gray-500 mb-4">
              ¿Por qué estás reportando a este usuario?
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
                <select
                  value={razon}
                  onChange={(e) => setRazon(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {motivos.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción <span className="text-gray-400">(opcional)</span>
                </label>
                <Textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Describe el motivo del reporte..."
                  rows={3}
                  className="text-sm"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setAbierto(false)}>
                  Cancelar
                </Button>
                <Button type="submit" size="sm" disabled={enviando}>
                  {enviando ? "Enviando..." : "Enviar reporte"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
