"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Get user's purchase history (participations)
 */
export async function obtenerHistorialCompras() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "No autorizado" };

  try {
    const usuarioId = parseInt(session.user.id);

    const participaciones = await prisma.participacion.findMany({
      where: { usuario_id: usuarioId },
      include: {
        publicacion: {
          select: {
            id_publicacion: true,
            titulo: true,
            descripcion: true,
            precio_mayoreo: true,
            estado: true,
            fecha_limite: true,
            meta_unidades: true,
            creador: {
              select: { nombre: true, localidad: true },
            },
          },
        },
      },
      orderBy: { fecha_solicitud: "desc" },
    });

    // Serialize Decimal values
    const serializar = (p: any) => ({
      ...p,
      publicacion: p.publicacion ? {
        ...p.publicacion,
        precio_mayoreo: Number(p.publicacion.precio_mayoreo),
      } : p.publicacion,
    });
    const participacionesPlanas = participaciones.map(serializar);
    const comprasActivas = participacionesPlanas.filter(
      (p: any) => p.estado === "APPROVED" && p.publicacion.estado === "ACTIVA"
    );
    const comprasCompletadas = participacionesPlanas.filter(
      (p: any) => p.estado === "APPROVED" && p.publicacion.estado === "META_ALCANZADA"
    );
    const comprasPendientes = participacionesPlanas.filter((p: any) => p.estado === "PENDING");

    return {
      success: true,
      total: participacionesPlanas.length,
      participaciones: participacionesPlanas,
      comprasActivas,
      comprasCompletadas,
      comprasPendientes,
    };
  } catch (error) {
    console.error("Error al obtener historial:", error);
    return { error: "Error al obtener historial de compras" };
  }
}

/**
 * Get creator's pending requests
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
        usuario: {
          select: { nombre: true, correo: true, localidad: true },
        },
        publicacion: {
          select: { titulo: true, id_publicacion: true },
        },
      },
      orderBy: { fecha_solicitud: "desc" },
    });

    return { success: true, solicitudes };
  } catch (error) {
    console.error("Error al obtener solicitudes:", error);
    return { error: "Error al obtener solicitudes" };
  }
}

/**
 * Get user profile data
 */
export async function obtenerDatosPerfil(usuarioId?: number) {
  const session = await getServerSession(authOptions);
  const userId = usuarioId || (session?.user?.id ? parseInt(session.user.id) : null);

  if (!userId) return { error: "No autorizado" };

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: userId },
      select: {
        id_usuario: true,
        nombre: true,
        correo: true,
        localidad: true,
        telefono: true,
        rol: true,
        calificacion_promedio: true,
        compras_completadas: true,
        _count: {
          select: {
            publicaciones: true,
            participaciones: true,
            resenas_recibidas: true,
          },
        },
        publicaciones: {
          select: {
            id_publicacion: true,
            titulo: true,
            precio_mayoreo: true,
            meta_unidades: true,
            estado: true,
            fecha_limite: true,
            participaciones: {
              select: { cantidad: true },
            },
          },
          orderBy: { fecha_limite: "desc" },
        },
      },
    });

    if (!usuario) {
      return { error: "Usuario no encontrado" };
    }

    const publicacionesConTotal = usuario.publicaciones.map((p) => ({
      ...p,
      precio_mayoreo: Number(p.precio_mayoreo),
      totalUnidades: p.participaciones.reduce((acc, part) => acc + part.cantidad, 0),
    }));

    const usuarioPlano = {
      ...usuario,
      calificacion_promedio: Number(usuario.calificacion_promedio),
      publicaciones: publicacionesConTotal,
    };

    return { success: true, usuario: usuarioPlano };
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    return { error: "Error al obtener datos del perfil" };
  }
}
