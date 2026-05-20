"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ParticipacionSchema = z.object({
  publicacion_id: z.coerce.number().int().positive(),
  cantidad: z.coerce.number().int().min(1),
});

/**
 * Request to join a collaborative order
 */
export async function solicitarUnirse(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "No autorizado" };

  const rawData = Object.fromEntries(formData.entries());
  const validation = ParticipacionSchema.safeParse(rawData);

  if (!validation.success) {
    return { errors: validation.error.flatten().fieldErrors };
  }

  try {
    const data = validation.data;
    const usuarioId = parseInt(session.user.id);

    // Check if publication exists
    const publicacion = await prisma.publicacion.findUnique({
      where: { id_publicacion: data.publicacion_id },
      include: { creador: { select: { penalizado_hasta: true } } },
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

    // Check if already exists
    const existente = await prisma.participacion.findFirst({
      where: {
        usuario_id: usuarioId,
        publicacion_id: data.publicacion_id,
      },
    });

    if (existente) {
      return { error: "Ya has solicitado unirte a esta compra" };
    }

    // Can't join own publication
    if (publicacion.creador_id === usuarioId) {
      return { error: "No puedes unirte a tu propia publicación" };
    }

    await prisma.participacion.create({
      data: {
        usuario_id: usuarioId,
        publicacion_id: data.publicacion_id,
        cantidad: data.cantidad,
        estado: "PENDING",
      },
    });

    revalidatePath(`/producto/${data.publicacion_id}`);
    return { success: true };
  } catch (error) {
    console.error("Error al solicitar unión:", error);
    return { error: "Error al procesar la solicitud" };
  }
}

/**
 * Creator approves a participation request
 */
export async function aprobarParticipacion(participacionId: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "No autorizado" };

  try {
    const usuarioId = parseInt(session.user.id);

    const participacion = await prisma.participacion.findUnique({
      where: { id_participacion: participacionId },
      include: { publicacion: true },
    });

    if (!participacion) {
      return { error: "Participación no encontrada" };
    }

    // Only creator can approve
    if (participacion.publicacion.creador_id !== usuarioId) {
      return { error: "Solo el creador puede aprobar participaciones" };
    }

    await prisma.participacion.update({
      where: { id_participacion: participacionId },
      data: {
        estado: "APPROVED",
        fecha_aprobacion: new Date(),
      },
    });

    revalidatePath(`/producto/${participacion.publicacion_id}`);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error al aprobar participación:", error);
    return { error: "Error al aprobar participación" };
  }
}

/**
 * Creator rejects a participation request
 */
export async function rechazarParticipacion(participacionId: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "No autorizado" };

  try {
    const usuarioId = parseInt(session.user.id);

    const participacion = await prisma.participacion.findUnique({
      where: { id_participacion: participacionId },
      include: { publicacion: true },
    });

    if (!participacion) {
      return { error: "Participación no encontrada" };
    }

    // Only creator can reject
    if (participacion.publicacion.creador_id !== usuarioId) {
      return { error: "Solo el creador puede rechazar participaciones" };
    }

    await prisma.participacion.update({
      where: { id_participacion: participacionId },
      data: {
        estado: "REJECTED",
      },
    });

    revalidatePath(`/producto/${participacion.publicacion_id}`);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error al rechazar participación:", error);
    return { error: "Error al rechazar participación" };
  }
}

/**
 * Get participation requests for creator's publications
 */
export async function obtenerSolicitudesCreador() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "No autorizado" };

  try {
    const usuarioId = parseInt(session.user.id);

    const solicitudes = await prisma.participacion.findMany({
      where: {
        publicacion: {
          creador_id: usuarioId,
        },
        estado: "PENDING",
      },
      include: {
        usuario: true,
        publicacion: true,
      },
      orderBy: {
        fecha_solicitud: "desc",
      },
    });

    const solicitudesPlanas = solicitudes.map((s) => ({
      ...s,
      usuario: s.usuario ? {
        ...s.usuario,
        calificacion_promedio: Number(s.usuario.calificacion_promedio),
      } : s.usuario,
      publicacion: s.publicacion ? {
        ...s.publicacion,
        precio_unitario: Number(s.publicacion.precio_unitario),
        precio_mayoreo: Number(s.publicacion.precio_mayoreo),
      } : s.publicacion,
    }));

    return { success: true, solicitudes: solicitudesPlanas };
  } catch (error) {
    console.error("Error al obtener solicitudes:", error);
    return { error: "Error al obtener solicitudes" };
  }
}

/**
 * Get user's participation requests
 */
export async function obtenerMisSolicitudes() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "No autorizado" };

  try {
    const usuarioId = parseInt(session.user.id);

    const solicitudes = await prisma.participacion.findMany({
      where: {
        usuario_id: usuarioId,
      },
      include: {
        publicacion: true,
        usuario: true,
      },
      orderBy: {
        fecha_solicitud: "desc",
      },
    });

    const solicitudesPlanas = solicitudes.map((s) => ({
      ...s,
      usuario: s.usuario ? {
        ...s.usuario,
        calificacion_promedio: Number(s.usuario.calificacion_promedio),
      } : s.usuario,
      publicacion: s.publicacion ? {
        ...s.publicacion,
        precio_unitario: Number(s.publicacion.precio_unitario),
        precio_mayoreo: Number(s.publicacion.precio_mayoreo),
      } : s.publicacion,
    }));

    return { success: true, solicitudes: solicitudesPlanas };
  } catch (error) {
    console.error("Error al obtener mis solicitudes:", error);
    return { error: "Error al obtener solicitudes" };
  }
}
