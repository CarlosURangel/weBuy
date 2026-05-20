import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import DashboardClient from "./DashboardClient";

export default async function CatalogoPage() {
  const session = await getServerSession(authOptions);
  const userLocalidad = (session?.user as any)?.localidad;
  const userId = session?.user?.id;

  const publicaciones = await prisma.publicacion.findMany({
    where: { estado: "ACTIVA" },
    include: {
      creador: { select: { nombre: true, localidad: true, telefono: true } },
      participaciones: { 
        where: { estado: "APPROVED" },
        select: { cantidad: true, usuario_id: true } 
      }
    },
    orderBy: { fecha_limite: 'asc' }
  });

  // Get pending requests for current user
  const solicitudesPendientesRaw = userId ? await prisma.participacion.findMany({
    where: {
      usuario_id: parseInt(userId),
      estado: "PENDING"
    },
    include: {
      publicacion: true
    }
  }) : [];

  const solicitudesPendientes = solicitudesPendientesRaw.map(s => ({
    ...s,
    publicacion: s.publicacion ? {
      ...s.publicacion,
      precio_unitario: Number(s.publicacion.precio_unitario),
      precio_mayoreo: Number(s.publicacion.precio_mayoreo),
    } : s.publicacion,
  }));

  // Get pending requests as creator
  const solicitudesCreador = userId ? await prisma.participacion.findMany({
    where: {
      publicacion: { creador_id: parseInt(userId) },
      estado: "PENDING"
    },
    include: {
      usuario: { select: { nombre: true } },
      publicacion: { select: { titulo: true, id_publicacion: true } }
    },
    orderBy: { fecha_solicitud: "desc" }
  }) : [];

  const publicacionesConInfo = publicaciones.map(p => ({
    id_publicacion: p.id_publicacion,
    titulo: p.titulo,
    imagen_url: p.imagen_url,
    precio_unitario: Number(p.precio_unitario),
    precio_mayoreo: Number(p.precio_mayoreo),
    meta_unidades: p.meta_unidades,
    fecha_limite: p.fecha_limite.toISOString(),
    creador: p.creador,
    participaciones: p.participaciones,
    totalUnidades: p.participaciones.reduce((acc, part) => acc + part.cantidad, 0),
    esCreador: userId === p.creador_id.toString()
  }));

  return (
    <DashboardClient 
      publicaciones={publicacionesConInfo} 
      userLocalidad={userLocalidad} 
      session={session}
      solicitudesPendientes={solicitudesPendientes}
      solicitudesCreador={solicitudesCreador}
    />
  );
}