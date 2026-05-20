"use client";

import { borrarPublicacion } from "@/app/actions/publicaciones";
import { useTransition } from "react";
import { toast } from "sonner";

export default function BotonBorrar({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition();

  const handleBorrar = () => {
    if (!confirm("¿Estás seguro de cancelar esta compra grupal?")) return;

    startTransition(async () => {
      const res = await borrarPublicacion(id);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Publicación eliminada");
      }
    });
  };

  return (
    <button 
      onClick={handleBorrar} 
      disabled={isPending}
      style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer', opacity: isPending ? 0.5 : 1 }}
    >
      {isPending ? "Borrando..." : "Eliminar"}
    </button>
  );
}