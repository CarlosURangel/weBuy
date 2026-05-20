"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ReviewSchema = z.object({
  resena_a_id: z.coerce.number().int().positive(),
  calificacion: z.coerce.number().int().min(1).max(5),
  comentario: z.string().optional(),
  publicacion_id: z.coerce.number().int().positive().optional(),
});

const ReportSchema = z.object({
  reportado_id: z.coerce.number().int().positive(),
  razon: z.enum(["FRAUDE", "SPAM", "COMPORTAMIENTO_INAPROPIADO", "OTRO"]),
  descripcion: z.string().optional(),
});

/**
 * Create a review for a user after completing a collaborative purchase
 */
export async function crearResena(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "No autorizado" };

  const rawData = Object.fromEntries(formData.entries());
  const validation = ReviewSchema.safeParse(rawData);

  if (!validation.success) {
    return { errors: validation.error.flatten().fieldErrors };
  }

  try {
    const data = validation.data;
    const resenaDeId = parseInt(session.user.id);

    if (resenaDeId === data.resena_a_id) {
      return { error: "No puedes reseñarte a ti mismo" };
    }

    // Check if user exists
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: data.resena_a_id },
    });

    if (!usuario) {
      return { error: "El usuario no existe" };
    }

    // Check if review already exists (per publication if specified)
    const existente = data.publicacion_id
      ? await prisma.review.findFirst({
          where: {
            resena_de_id: resenaDeId,
            resena_a_id: data.resena_a_id,
            publicacion_id: data.publicacion_id,
          },
        })
      : await prisma.review.findFirst({
          where: {
            resena_de_id: resenaDeId,
            resena_a_id: data.resena_a_id,
            publicacion_id: null,
          },
        });

    if (existente) {
      return { error: "Ya has reseñado a este usuario en esta compra" };
    }

    await prisma.review.create({
      data: {
        resena_de_id: resenaDeId,
        resena_a_id: data.resena_a_id,
        publicacion_id: data.publicacion_id,
        calificacion: data.calificacion,
        comentario: data.comentario,
      },
    });

    // Recalculate reputation
    await recalcularReputacion(data.resena_a_id);

    revalidatePath(`/perfil/${data.resena_a_id}`);
    return { success: true };
  } catch (error) {
    console.error("Error al crear reseña:", error);
    return { error: "Error al crear reseña" };
  }
}

/**
 * Report a user for misconduct
 */
export async function crearReporte(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "No autorizado" };

  const rawData = Object.fromEntries(formData.entries());
  const validation = ReportSchema.safeParse(rawData);

  if (!validation.success) {
    return { errors: validation.error.flatten().fieldErrors };
  }

  try {
    const data = validation.data;
    const reporteroId = parseInt(session.user.id);

    if (reporteroId === data.reportado_id) {
      return { error: "No puedes reportarte a ti mismo" };
    }

    // Check if user exists
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: data.reportado_id },
    });

    if (!usuario) {
      return { error: "El usuario no existe" };
    }

    // Check if already reported by this user
    const existente = await prisma.report.findFirst({
      where: {
        reportero_id: reporteroId,
        reportado_id: data.reportado_id,
      },
    });

    if (existente) {
      return { error: "Ya has reportado a este usuario" };
    }

    await prisma.report.create({
      data: {
        reportero_id: reporteroId,
        reportado_id: data.reportado_id,
        razon: data.razon,
        descripcion: data.descripcion,
      },
    });

    return { success: true, message: "Reporte enviado. Gracias por ayudarnos a mantener la comunidad segura." };
  } catch (error) {
    console.error("Error al crear reporte:", error);
    return { error: "Error al crear reporte" };
  }
}

/**
 * Get user's reputation data
 */
export async function obtenerReputacionUsuario(usuarioId: number) {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: usuarioId },
      select: {
        calificacion_promedio: true,
        compras_completadas: true,
      },
    });

    if (!usuario) {
      return { error: "Usuario no encontrado" };
    }

    return { success: true, ...usuario };
  } catch (error) {
    console.error("Error al obtener reputación:", error);
    return { error: "Error al obtener reputación" };
  }
}

/**
 * Recalculate user's reputation based on reviews
 */
export async function recalcularReputacion(usuarioId: number) {
  try {
    const resenas = await prisma.review.findMany({
      where: { resena_a_id: usuarioId },
    });

    if (resenas.length === 0) {
      await prisma.usuario.update({
        where: { id_usuario: usuarioId },
        data: {
          calificacion_promedio: 0,
        },
      });
      return;
    }

    const sumaCalificaciones = resenas.reduce((acc, r) => acc + r.calificacion, 0);
    const promedio = sumaCalificaciones / resenas.length;

    await prisma.usuario.update({
      where: { id_usuario: usuarioId },
      data: {
        calificacion_promedio: parseFloat(promedio.toFixed(2)),
      },
    });
  } catch (error) {
    console.error("Error al recalcular reputación:", error);
  }
}

/**
 * Get reviews for a user
 */
export async function obtenerResenasUsuario(usuarioId: number) {
  try {
    const resenas = await prisma.review.findMany({
      where: { resena_a_id: usuarioId },
      include: {
        resena_de: {
          select: { nombre: true },
        },
      },
      orderBy: { fecha_creacion: "desc" },
    });

    return { success: true, resenas };
  } catch (error) {
    console.error("Error al obtener reseñas:", error);
    return { error: "Error al obtener reseñas" };
  }
}
