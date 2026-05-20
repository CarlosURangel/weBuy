"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const PublicacionSchema = z.object({
  titulo: z.string().min(5, "El título es muy corto"),
  descripcion: z.string().min(10, "Describe mejor el producto"),
  url_origen: z.string().url("Debe ser un enlace válido (ej. Alibaba, Amazon)"),
  imagen_url: z.string().url("Debe ser un link válido a una imagen").optional().or(z.literal('')),
  precio_unitario: z.coerce.number().positive("El precio debe ser mayor a 0"),
  precio_mayoreo: z.coerce.number().positive("El precio de mayoreo debe ser mayor a 0"),
  meta_unidades: z.coerce.number().int().min(2, "La meta mínima son 2 unidades"),
  fecha_limite: z.string().refine((date) => new Date(date) > new Date(), {
    message: "La fecha límite debe ser en el futuro",
  }),
});

export async function crearPublicacion(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "No autorizado" };

  const rawData = Object.fromEntries(formData.entries());
  const validation = PublicacionSchema.safeParse(rawData);

  if (!validation.success) {
    return { errors: validation.error.flatten().fieldErrors };
  }

  try {
    const data = validation.data;
    await prisma.publicacion.create({
      data: {
        ...data,
        fecha_limite: new Date(data.fecha_limite),
        creador_id: parseInt(session.user.id),
        estado: "ACTIVA",
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: "Error al guardar en la base de datos" };
  }
}


export async function borrarPublicacion(id_publicacion : number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "No autorizado" };

  try {
    
    const publicacion = await prisma.publicacion.findUnique({
      where: { id_publicacion }
    });

    if (!publicacion) return { error: "Publicación no encontrada" };

    if (publicacion.creador_id !== parseInt(session.user.id) && session.user.rol !== "ADMINISTRADOR") {
      return { error: "No tienes permiso para borrar esto" };
    }

    await prisma.publicacion.delete({
      where: { id_publicacion }
    });

    revalidatePath("/");
    return { success: "Publicación eliminada" };
  } catch (error) {
    return { error: "No se pudo eliminar" };
  }
}


export async function obtenerPublicacionPorId(id: number) {
  try {
    const publicacion = await prisma.publicacion.findUnique({
      where: { id_publicacion: id },
      include: {
        creador: {
          select: { nombre: true, localidad: true, telefono: true, calificacion_promedio: true, compras_completadas: true }
        },
        
        participaciones: {
          include: {
            usuario: {
              select: { nombre: true }
            }
          }
        }
      }
    });

    if (!publicacion) return { error: "Publicación no encontrada" };

    // Only count APPROVED participations for progress
    const participacionesAprobadas = publicacion.participaciones.filter(
      p => p.estado === "APPROVED"
    );
    const totalUnidades = participacionesAprobadas.reduce((acc, p) => acc + p.cantidad, 0);
    
    if (totalUnidades >= publicacion.meta_unidades && publicacion.estado === "ACTIVA") {
      await prisma.publicacion.update({
        where: { id_publicacion: id },
        data: { estado: "META_ALCANZADA" }
      });
      publicacion.estado = "META_ALCANZADA";
    }
    
    // Serialize Decimal values for client components
    const publicacionPlana = {
      ...publicacion,
      precio_unitario: Number(publicacion.precio_unitario),
      precio_mayoreo: Number(publicacion.precio_mayoreo),
      creador: {
        ...publicacion.creador,
        calificacion_promedio: Number(publicacion.creador.calificacion_promedio),
      },
    };
    
    const imagesArray = publicacion.imagen_url ? [{ url: publicacion.imagen_url }] : [];

    return { success: true, publicacion: publicacionPlana, images: imagesArray, totalUnidades };
  } catch (error) {
    return { error: "No se pudo cargar el publicación" };
  }
}


export async function unirseCompraGrupal(id_publicacion: number, cantidad: number) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return { error: "Debes iniciar sesión para unirte a esta compra." };
  }

  try {
    const usuarioId = parseInt(session.user.id);

    // Check if publication exists
    const publicacion = await prisma.publicacion.findUnique({
      where: { id_publicacion }
    });

    if (!publicacion) {
      return { error: "La publicación no existe" };
    }

    // Check if user is penalized
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: usuarioId },
      select: { penalizado_hasta: true },
    });

    if (usuario?.penalizado_hasta && new Date(usuario.penalizado_hasta) > new Date()) {
      return { error: "No puedes solicitar unirte mientras tengas una penalización activa" };
    }

    // Check if user already has a participation request
    const existente = await prisma.participacion.findFirst({
      where: {
        usuario_id: usuarioId,
        publicacion_id: id_publicacion,
      }
    });

    if (existente) {
      return { error: "Ya has solicitado unirte a esta compra" };
    }

    // Create participation with PENDING status
    await prisma.participacion.create({
      data: {
        usuario_id: usuarioId,
        publicacion_id: id_publicacion,
        cantidad: cantidad,
        estado: "PENDING"
      }
    });

    
    revalidatePath(`/producto/${id_publicacion}`);
    revalidatePath(`/`);
    
    return { success: true };
  } catch (error) {
    console.error("Error al registrar participación:", error);
    return { error: "No se pudo registrar tu participación. Intenta de nuevo." };
  }
}