"use client";

import { useState } from "react";
import Link from "next/link";
import BotonBorrar from "@/components/BotonBorrar";
import { ShoppingBag, Search, MapPin, Plus, Image as ImageIcon, Globe, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/ui/Header";

interface Publicacion {
  id_publicacion: number;
  titulo: string;
  imagen_url: string | null;
  precio_unitario: number;
  precio_mayoreo: number;
  meta_unidades: number;
  fecha_limite: string;
  creador: { nombre: string; localidad: string; telefono: string };
  participaciones: { cantidad: number; usuario_id: number }[];
  totalUnidades: number;
  esCreador: boolean;
}

interface Solicitud {
  id_participacion: number;
  estado: string;
  publicacion: {
    id_publicacion: number;
    titulo: string;
  };
}

interface SolicitudCreador {
  id_participacion: number;
  estado: string;
  usuario: { nombre: string };
  publicacion: { titulo: string; id_publicacion: number };
}

export default function DashboardClient({
  publicaciones,
  userLocalidad,
  session,
  solicitudesPendientes = [],
  solicitudesCreador = [],
}: {
  publicaciones: Publicacion[],
  userLocalidad: string | null,
  session: { user: { name: string } } | null,
  solicitudesPendientes?: Solicitud[],
  solicitudesCreador?: SolicitudCreador[]
}) {
  const [filtroLocalidad, setFiltroLocalidad] = useState(true);

  const publicacionesMostrar = userLocalidad && filtroLocalidad
    ? publicaciones.filter(p => p.creador.localidad === userLocalidad)
    : publicaciones;

  const mostrarFiltro = userLocalidad && publicaciones.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Header session={session as any} />
      <div className="bg-[#2D1340] text-white py-12 px-6 lg:px-20 flex flex-col items-center">

        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight">WeBuy</h1>
        <h2 className="text-3xl md:text-5xl font-bold mb-8 text-center tracking-tight">
          Comprando juntos, <span className="text-accent">ahorro seguro</span>
        </h2>

        <div className="relative w-full max-w-lg mb-8 shadow-lg">
          <Input
            type="text"
            placeholder="Buscar productos..."
            className="w-full bg-white border-none rounded-md py-3.5 pl-6 pr-12 text-foreground placeholder:text-muted-foreground font-medium focus-visible:ring-2 focus-visible:ring-primary"
          />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors" aria-label="Buscar">
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-16 px-6">
        {/* Pending Requests Section - User's own requests */}
        {solicitudesPendientes.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
              Tus solicitudes pendientes ({solicitudesPendientes.length})
            </h4>
            <div className="space-y-2">
              {solicitudesPendientes.map((solicitud) => (
                <Link
                  key={solicitud.id_participacion}
                  href={`/producto/${solicitud.publicacion.id_publicacion}`}
                  className="flex items-center justify-between p-3 bg-white rounded border border-blue-100 hover:bg-blue-50 transition-colors"
                >
                  <span className="text-blue-900 font-medium truncate">
                    {solicitud.publicacion.titulo}
                  </span>
                  <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded">
                    Pendiente
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Pending Requests Section - Requests from others to creator's publications */}
        {solicitudesCreador.length > 0 && (
          <div className="mb-12 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="text-lg font-semibold text-yellow-900 mb-3 flex items-center gap-2">
              Solicitudes para tus publicaciones ({solicitudesCreador.length})
            </h4>
            <div className="space-y-2">
              {solicitudesCreador.map((solicitud) => (
                <Link
                  key={solicitud.id_participacion}
                  href={`/producto/${solicitud.publicacion.id_publicacion}`}
                  className="flex items-center justify-between p-3 bg-white rounded border border-yellow-100 hover:bg-yellow-50 transition-colors"
                >
                  <span className="text-yellow-900 font-medium truncate">
                    {solicitud.publicacion.titulo}
                  </span>
                  <span className="text-xs font-semibold text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                    {solicitud.usuario.nombre}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <h3 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">Productos</h3>

          {mostrarFiltro && (
            <div className="flex items-center gap-3 bg-muted/50 px-4 py-2 rounded-lg border">
              <Button
                onClick={() => setFiltroLocalidad(true)}
                variant={filtroLocalidad ? "default" : "ghost"}
                size="sm"
              >
                <Building2 className="w-4 h-4" />
                Mi zona ({userLocalidad})
              </Button>
              <Button
                onClick={() => setFiltroLocalidad(false)}
                variant={!filtroLocalidad ? "default" : "ghost"}
                size="sm"
              >
                <Globe className="w-4 h-4" />
                Todas
              </Button>
            </div>
          )}
        </div>

        {session && (
          <div className="mb-8">
            <Button asChild variant="default" className="font-bold">
              <Link href="/crear-publicacion">
                <Plus className="w-5 h-5" /> Crear Nueva Compra Grupal
              </Link>
            </Button>
          </div>
        )}

        {publicacionesMostrar.length === 0 ? (
          <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
            <p className="text-muted-foreground font-medium text-lg mb-1">
              {filtroLocalidad && userLocalidad
                ? `No hay compras grupales en ${userLocalidad}.`
                : "No hay compras grupales activas en este momento."}
            </p>
            <p className="text-muted-foreground text-sm">¡Sé el primero en crear una propuesta!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {publicacionesMostrar.map((pub) => {
              const porcentaje = Math.min(100, (pub.totalUnidades / pub.meta_unidades) * 100);

              return (
                <Card key={pub.id_publicacion} className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <Link href={`/producto/${pub.id_publicacion}`} className="absolute inset-0 z-0 rounded-xl" aria-label={`Ver detalles de ${pub.titulo}`} />

                  <div className="bg-muted/50 rounded-lg aspect-[4/5] mb-4 flex items-center justify-center overflow-hidden relative pointer-events-none m-3">
                    {pub.imagen_url ? (
                      <img src={pub.imagen_url} alt={pub.titulo} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <ImageIcon className="w-12 h-12 text-muted-foreground" />
                    )}
                    <Badge variant="secondary" className="absolute top-3 left-3 shadow-sm">
                      <MapPin className="w-3 h-3 mr-1" /> {pub.creador.localidad}
                    </Badge>
                  </div>

                  <div className="px-3 pb-3">
                    <h4 className="text-primary font-bold text-lg truncate mb-1 pr-2 tracking-tight">{pub.titulo}</h4>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-muted-foreground line-through text-sm font-medium">${pub.precio_unitario.toString()}</span>
                      <span className="font-extrabold text-foreground">${pub.precio_mayoreo.toString()}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="w-full mr-4">
                        <div className="flex justify-between text-xs text-muted-foreground font-medium mb-1.5">
                          <span>{pub.totalUnidades} pedidas</span>
                          <span>Meta: {pub.meta_unidades}</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary transition-all duration-500 rounded-full" style={{ width: `${porcentaje}%` }}></div>
                        </div>
                      </div>
                      <div className="border rounded-md min-w-[32px] h-8 flex items-center justify-center text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-white group-hover:border-primary">
                        <Plus className="w-4 h-4" />
                      </div>
                    </div>

                    {pub.esCreador && (
                      <div className="mt-4 pt-3 border-t text-right relative z-10">
                        <BotonBorrar id={pub.id_publicacion} />
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
