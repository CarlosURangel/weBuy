import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const userId = parseInt(session.user.id);

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: userId },
      select: {
        id_usuario: true,
        nombre: true,
        correo: true,
        localidad: true,
        telefono: true,
        calificacion_promedio: true,
        compras_completadas: true,
        _count: { select: { resenas_recibidas: true } }
      }
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const publicaciones = await prisma.publicacion.findMany({
      where: { creador_id: userId },
      select: {
        id_publicacion: true,
        titulo: true,
        precio_mayoreo: true,
        meta_unidades: true,
        estado: true,
        fecha_limite: true,
        participaciones: {
          select: { cantidad: true }
        }
      },
      orderBy: { fecha_limite: 'desc' }
    });

    const publicacionesConTotal = publicaciones.map(p => ({
      ...p,
      totalUnidades: p.participaciones.reduce((acc, part) => acc + part.cantidad, 0)
    }));

    const participaciones = await prisma.participacion.findMany({
      where: { usuario_id: userId },
      include: {
        publicacion: {
          select: {
            id_publicacion: true,
            titulo: true,
            precio_mayoreo: true,
            estado: true,
            creador: {
              select: {
                nombre: true,
                localidad: true
              }
            }
          }
        }
      },
      orderBy: { id_participacion: 'desc' }
    });

    return NextResponse.json({
      usuario: {
        id: usuario.id_usuario.toString(),
        name: usuario.nombre,
        email: usuario.correo,
        localidad: usuario.localidad,
        telefono: usuario.telefono,
        calificacion_promedio: Number(usuario.calificacion_promedio),
        compras_completadas: usuario.compras_completadas,
        resenas_recibidas: usuario._count.resenas_recibidas,
      },
      publicaciones: publicacionesConTotal,
      participaciones: participaciones.map(p => ({
        id_participacion: p.id_participacion,
        cantidad: p.cantidad,
        publicacion: p.publicacion
      }))
    });
  } catch (error) {
    console.error("Error en /api/perfil:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}