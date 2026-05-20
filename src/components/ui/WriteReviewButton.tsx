"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { crearResena } from "@/app/actions/reputacion";

interface WriteReviewButtonProps {
  usuarioId: number;
  usuarioNombre: string;
  publicacionId?: number;
  onSuccess?: () => void;
}

export function WriteReviewButton({ usuarioId, usuarioNombre, publicacionId, onSuccess }: WriteReviewButtonProps) {
  const [abierto, setAbierto] = useState(false);
  const [calificacion, setCalificacion] = useState(0);
  const [hover, setHover] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (calificacion === 0) {
      toast.error("Selecciona una calificación");
      return;
    }
    setEnviando(true);
    try {
      const formData = new FormData();
      formData.append("resena_a_id", usuarioId.toString());
      formData.append("calificacion", calificacion.toString());
      formData.append("comentario", comentario);
      if (publicacionId) {
        formData.append("publicacion_id", publicacionId.toString());
      }

      const result = await crearResena(formData);
      if (result.success) {
        toast.success("Reseña enviada");
        setAbierto(false);
        setCalificacion(0);
        setComentario("");
        onSuccess?.();
      } else {
        toast.error(result.error || "Error al enviar reseña");
      }
    } catch {
      toast.error("Error al enviar reseña");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <Button size="sm" onClick={() => setAbierto(true)}>
        <Star className="w-4 h-4 mr-1" />
        Dejar reseña
      </Button>

      {abierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Reseñar a {usuarioNombre}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              ¿Cómo fue tu experiencia con este usuario?
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setCalificacion(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className="p-1 transition-colors"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= (hover || calificacion)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comentario <span className="text-gray-400">(opcional)</span>
                </label>
                <Textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="Cuenta tu experiencia..."
                  rows={3}
                  className="text-sm"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setAbierto(false)}>
                  Cancelar
                </Button>
                <Button type="submit" size="sm" disabled={enviando}>
                  {enviando ? "Enviando..." : "Enviar reseña"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
