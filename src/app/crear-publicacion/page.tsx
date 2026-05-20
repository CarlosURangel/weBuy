"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { crearPublicacion } from "@/app/actions/publicaciones";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Header } from "@/components/ui/Header";
import { useSession } from "next-auth/react";

export default function CrearPublicacionPage() {
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    setErrors({});
    startTransition(async () => {
      const res = await crearPublicacion(formData);
      if (res?.errors) {
        setErrors(res.errors);
        toast.error("Por favor, revisa los campos en rojo.");
      } else if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("¡Publicación creada exitosamente!");
        router.push("/");
      }
    });
  };

  return (
    <div className="min-h-screen bg-muted/50">
      <Header session={session as any} />
      <div className="py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-start">
        <div className="w-full max-w-3xl bg-card rounded-xl shadow-xl overflow-hidden border">
          <div className="bg-[#2D1340] text-white py-8 px-10">
            <h1 className="text-3xl font-bold">Nueva Propuesta de Compra</h1>
            <p className="text-gray-300 mt-2 text-sm">
              Define el producto y la meta para que otros emprendedores se unan al ahorro.
            </p>
          </div>

        <form action={handleSubmit} className="py-10 px-10 flex flex-col gap-6">
          <div className="grid gap-2">
            <Label htmlFor="titulo">Título de la publicación</Label>
            <Input
              id="titulo"
              name="titulo"
              placeholder="Ej. Lote de Sudaderas Essentials"
              className={errors.titulo ? "border-destructive" : ""}
              disabled={isPending}
            />
            {errors.titulo && <span className="text-xs text-destructive font-medium">{errors.titulo[0]}</span>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="descripcion">Descripción del producto</Label>
            <Textarea
              id="descripcion"
              name="descripcion"
              disabled={isPending}
              placeholder="Detalla colores, tallas disponibles, material, etc..."
              className={`min-h-[120px] resize-y ${errors.descripcion ? "border-destructive" : ""}`}
            />
            {errors.descripcion && <span className="text-xs text-destructive font-medium">{errors.descripcion[0]}</span>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="url_origen">Link del producto original</Label>
            <Input
              id="url_origen"
              name="url_origen"
              type="url"
              placeholder="https://alibaba.com/..."
              className={errors.url_origen ? "border-destructive" : ""}
              disabled={isPending}
            />
            {errors.url_origen && <span className="text-xs text-destructive font-medium">{errors.url_origen[0]}</span>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="imagen_url">URL de la Imagen (Opcional)</Label>
            <Input
              id="imagen_url"
              name="imagen_url"
              type="url"
              placeholder="https://ejemplo.com/foto-producto.jpg"
              className={errors.imagen_url ? "border-destructive" : ""}
              disabled={isPending}
            />
            {errors.imagen_url && <span className="text-xs text-destructive font-medium">{errors.imagen_url[0]}</span>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label htmlFor="precio_unitario">Precio Unitario (Normal) $</Label>
              <Input
                id="precio_unitario"
                name="precio_unitario"
                type="number"
                step="0.01"
                placeholder="0.00"
                className={errors.precio_unitario ? "border-destructive" : ""}
                disabled={isPending}
              />
              {errors.precio_unitario && <span className="text-xs text-destructive font-medium">{errors.precio_unitario[0]}</span>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="precio_mayoreo">Precio Mayoreo Meta $</Label>
              <Input
                id="precio_mayoreo"
                name="precio_mayoreo"
                type="number"
                step="0.01"
                placeholder="0.00"
                className={errors.precio_mayoreo ? "border-destructive" : ""}
                disabled={isPending}
              />
              {errors.precio_mayoreo && <span className="text-xs text-destructive font-medium">{errors.precio_mayoreo[0]}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label htmlFor="meta_unidades">Meta de unidades totales</Label>
              <Input
                id="meta_unidades"
                name="meta_unidades"
                type="number"
                placeholder="Ej. 50"
                className={errors.meta_unidades ? "border-destructive" : ""}
                disabled={isPending}
              />
              {errors.meta_unidades && <span className="text-xs text-destructive font-medium">{errors.meta_unidades[0]}</span>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fecha_limite">Fecha límite para unirse</Label>
              <Input
                id="fecha_limite"
                name="fecha_limite"
                type="date"
                className={errors.fecha_limite ? "border-destructive" : ""}
                disabled={isPending}
              />
              {errors.fecha_limite && <span className="text-xs text-destructive font-medium">{errors.fecha_limite[0]}</span>}
            </div>
          </div>

          <div className="mt-4 pt-6 border-t">
            <Button type="submit" variant="default" size="lg" disabled={isPending} className="w-full text-lg">
              {isPending ? "Publicando propuesta..." : "Crear Publicación Grupal"}
            </Button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
