"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

async function verificarAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return false;
  const usuario = await prisma.usuario.findUnique({
    where: { id_usuario: parseInt(session.user.id) },
    select: { rol: true },
  });
  return usuario?.rol === "ADMINISTRADOR";
}

export async function obtenerReportes() {
  if (!(await verificarAdmin())) return { error: "No autorizado" };

  try {
    const reportes = await prisma.report.findMany({
      include: {
        reportero: { select: { id_usuario: true, nombre: true, correo: true } },
        reportado: { select: { id_usuario: true, nombre: true, correo: true, penalizado_hasta: true } },
      },
      orderBy: { fecha_reporte: "desc" },
    });

    return { success: true, reportes };
  } catch (error) {
    console.error("Error al obtener reportes:", error);
    return { error: "Error al obtener reportes" };
  }
}

export async function actualizarEstadoReporte(reporteId: number, estado: string) {
  if (!(await verificarAdmin())) return { error: "No autorizado" };

  try {
    await prisma.report.update({
      where: { id_reporte: reporteId },
      data: { estado: estado as any },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error al actualizar reporte:", error);
    return { error: "Error al actualizar reporte" };
  }
}

export async function aplicarPenalizacion(usuarioId: number, dias: number) {
  if (!(await verificarAdmin())) return { error: "No autorizado" };

  try {
    const penalizadoHasta = new Date();
    penalizadoHasta.setDate(penalizadoHasta.getDate() + dias);

    await prisma.usuario.update({
      where: { id_usuario: usuarioId },
      data: { penalizado_hasta: penalizadoHasta },
    });

    revalidatePath("/admin");
    return { success: true, message: `Usuario penalizado hasta ${penalizadoHasta.toLocaleDateString()}` };
  } catch (error) {
    console.error("Error al aplicar penalización:", error);
    return { error: "Error al aplicar penalización" };
  }
}

export async function quitarPenalizacion(usuarioId: number) {
  if (!(await verificarAdmin())) return { error: "No autorizado" };

  try {
    await prisma.usuario.update({
      where: { id_usuario: usuarioId },
      data: { penalizado_hasta: null },
    });

    revalidatePath("/admin");
    return { success: true, message: "Penalización removida" };
  } catch (error) {
    console.error("Error al quitar penalización:", error);
    return { error: "Error al quitar penalización" };
  }
}

export async function obtenerTodasResenas() {
  if (!(await verificarAdmin())) return { error: "No autorizado" };

  try {
    const resenas = await prisma.review.findMany({
      include: {
        resena_de: { select: { id_usuario: true, nombre: true } },
        resena_a: { select: { id_usuario: true, nombre: true } },
      },
      orderBy: { fecha_creacion: "desc" },
    });

    return { success: true, resenas };
  } catch (error) {
    console.error("Error al obtener reseñas:", error);
    return { error: "Error al obtener reseñas" };
  }
}

export async function eliminarResenaAdmin(resenaId: number) {
  if (!(await verificarAdmin())) return { error: "No autorizado" };

  try {
    await prisma.review.delete({ where: { id_resena: resenaId } });
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar reseña:", error);
    return { error: "Error al eliminar reseña" };
  }
}

export async function obtenerUsuarios() {
  if (!(await verificarAdmin())) return { error: "No autorizado" };

  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id_usuario: true,
        nombre: true,
        correo: true,
        localidad: true,
        rol: true,
        penalizado_hasta: true,
        compras_completadas: true,
        calificacion_promedio: true,
        _count: {
          select: {
            reportes_recibidos: { where: { estado: "PENDIENTE" } },
          },
        },
      },
      orderBy: { id_usuario: "asc" },
    });

    return { success: true, usuarios: usuarios.map(u => ({ ...u, calificacion_promedio: Number(u.calificacion_promedio) })) };
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return { error: "Error al obtener usuarios" };
  }
}
