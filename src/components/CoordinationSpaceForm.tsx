"use client";

import { useState } from "react";
import { crearPostCoordinacion } from "@/app/actions/coordinacion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface CoordinationSpaceFormProps {
  publicacionId: number;
}

export function CoordinationSpaceForm({ publicacionId }: CoordinationSpaceFormProps) {
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contenido.trim()) {
      toast.error("Escribe un mensaje");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("publicacion_id", publicacionId.toString());
      formData.append("titulo", titulo.trim() || contenido.slice(0, 50));
      formData.append("contenido", contenido);
      formData.append("tipo", "GENERAL");

      const result = await crearPostCoordinacion(formData);

      if (result.success) {
        toast.success("Mensaje publicado");
        setTitulo("");
        setContenido("");
      } else {
        toast.error(result.error || "Error al publicar");
      }
    } catch {
      toast.error("Error al publicar mensaje");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4 bg-white border border-gray-200">
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Asunto (opcional)"
          className="text-sm"
        />
        <Textarea
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          placeholder="Escribe tu mensaje..."
          rows={3}
          className="text-sm resize-none"
        />
        <Button type="submit" disabled={loading} size="sm" className="w-full">
          {loading ? "Publicando..." : "Publicar mensaje"}
        </Button>
      </form>
    </Card>
  );
}
