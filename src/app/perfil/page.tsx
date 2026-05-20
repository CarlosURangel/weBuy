"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, User, Package, ShoppingBag, MapPin, Calendar, Star, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ReputationBadge } from "@/components/ReputationBadge";
import { RequestsList } from "@/components/RequestsList";
import { Header } from "@/components/ui/Header";
import { useSession } from "next-auth/react";
import { obtenerDatosPerfil } from "@/app/actions/historial";
import { obtenerHistorialCompras } from "@/app/actions/historial";
import { obtenerSolicitudesCreador } from "@/app/actions/participaciones";
import { obtenerResenasUsuario } from "@/app/actions/reputacion";
import { WriteReviewButton } from "@/components/ui/WriteReviewButton";

export default function PerfilPage() {
  const { data: session } = useSession();
  const [usuario, setUsuario] = useState<any>(null);
  const [comprasActivas, setComprasActivas] = useState<any[]>([]);
  const [comprasCompletadas, setComprasCompletadas] = useState<any[]>([]);
  const [comprasPendientes, setComprasPendientes] = useState<any[]>([]);
  const [solicitudesCreador, setSolicitudesCreador] = useState<any[]>([]);
  const [misPublicaciones, setMisPublicaciones] = useState<any[]>([]);
  const [resenasRecibidas, setResenasRecibidas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function cargarDatos() {
      try {
        const [perfilRes, historialRes, solicitudesRes] = await Promise.all([
          obtenerDatosPerfil(),
          obtenerHistorialCompras(),
          obtenerSolicitudesCreador(),
        ]);

        let resenasData: any[] = [];
        if (perfilRes.success && perfilRes.usuario) {
          const resenasRes = await obtenerResenasUsuario((perfilRes.usuario as any).id_usuario);
          if (resenasRes.success) {
            resenasData = (resenasRes as any).resenas || [];
          }
        }

        if (!perfilRes.success || !perfilRes.usuario) {
          setError("No se pudo cargar el perfil");
          return;
        }

        setUsuario(perfilRes.usuario);
        setMisPublicaciones((perfilRes.usuario as any).publicaciones || []);
        setResenasRecibidas(resenasData);

        if (historialRes.success) {
          setComprasActivas(historialRes.comprasActivas || []);
          setComprasCompletadas(historialRes.comprasCompletadas || []);
          setComprasPendientes(historialRes.comprasPendientes || []);
        }

        if (solicitudesRes.success) {
          setSolicitudesCreador(solicitudesRes.solicitudes || []);
        }
      } catch (err) {
        setError("Error al cargar datos");
      } finally {
        setCargando(false);
      }
    }
    cargarDatos();
  }, []);

  if (cargando) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !usuario) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <p className="text-muted-foreground mb-4">{error || "Debes iniciar sesión para ver tu perfil"}</p>
        <Button asChild>
          <Link href="/login">Iniciar Sesión</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header session={session as any} />
      <div className="bg-[#2D1340] text-white py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-6">
          <Avatar className="w-24 h-24">
            <AvatarFallback className="bg-accent text-[#2D1340] text-4xl font-extrabold">
              {usuario.nombre.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-extrabold">{usuario.nombre}</h1>
            <p className="text-gray-300 font-medium">{usuario.correo}</p>
            <div className="flex items-center justify-center md:justify-start gap-2 mt-2 text-gray-300">
              <MapPin className="w-4 h-4" />
              <span>{usuario.localidad}</span>
            </div>
          </div>
          <ReputationBadge
            calificacion={Number(usuario.calificacion_promedio)}
            comprasCompletadas={usuario.compras_completadas}
          />
        </div>
      </div>

      <div className="max-w-5xl mx-auto -mt-6 px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-3xl font-extrabold text-primary">{misPublicaciones.length}</div>
              <div className="text-muted-foreground text-sm font-medium">Mis publicaciones</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-3xl font-extrabold text-green-600">{comprasActivas.length}</div>
              <div className="text-muted-foreground text-sm font-medium">Compras activas</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-3xl font-extrabold text-accent">{comprasCompletadas.length}</div>
              <div className="text-muted-foreground text-sm font-medium">Completadas</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-3xl font-extrabold text-blue-600">{comprasPendientes.length}</div>
              <div className="text-muted-foreground text-sm font-medium">Solicitudes pendientes</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-10 px-6 pb-24 md:pb-10">
        <Tabs defaultValue="activas">
          <TabsList className="mb-8 flex-wrap">
            <TabsTrigger value="activas">
              <ShoppingBag className="w-5 h-5 mr-2" />
              Activas
            </TabsTrigger>
            <TabsTrigger value="completadas">
              <CheckCircle className="w-5 h-5 mr-2" />
              Completadas
            </TabsTrigger>
            <TabsTrigger value="pendientes">
              <Clock className="w-5 h-5 mr-2" />
              Pendientes
            </TabsTrigger>
            <TabsTrigger value="solicitudes">
              <AlertCircle className="w-5 h-5 mr-2" />
              Solicitudes
            </TabsTrigger>
            <TabsTrigger value="publicaciones">
              <Package className="w-5 h-5 mr-2" />
              Mis Publicaciones
            </TabsTrigger>
            <TabsTrigger value="resenas">
              <Star className="w-5 h-5 mr-2" />
              Reseñas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activas">
            {comprasActivas.length === 0 ? (
              <EmptyState icon={ShoppingBag} message="No tienes compras activas" actionLabel="Explorar Compras" actionHref="/dashboard" />
            ) : (
              <div className="space-y-4">
                {comprasActivas.map(part => (
                  <CompraCard key={part.id_participacion} part={part} estadoBadge="Activa" badgeVariant="success" />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completadas">
            {comprasCompletadas.length === 0 ? (
              <EmptyState icon={CheckCircle} message="No hay compras completadas aún" actionLabel="Explorar Compras" actionHref="/dashboard" />
            ) : (
              <div className="space-y-4">
                {comprasCompletadas.map(part => (
                  <CompraCard key={part.id_participacion} part={part} estadoBadge="Completada" badgeVariant="accent" />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pendientes">
            {comprasPendientes.length === 0 ? (
              <EmptyState icon={Clock} message="No tienes solicitudes pendientes" actionLabel="Explorar Compras" actionHref="/dashboard" />
            ) : (
              <div className="space-y-4">
                {comprasPendientes.map(part => (
                  <CompraCard key={part.id_participacion} part={part} estadoBadge="Pendiente" badgeVariant="secondary" />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="solicitudes">
            {solicitudesCreador.length === 0 ? (
              <EmptyState icon={AlertCircle} message="No tienes solicitudes pendientes de otros usuarios" />
            ) : (
              <div>
                <h4 className="font-semibold text-lg mb-4 text-foreground">
                  Solicitudes para aprobar ({solicitudesCreador.length})
                </h4>
                <RequestsList solicitudes={solicitudesCreador} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="publicaciones">
            {misPublicaciones.length === 0 ? (
              <EmptyState icon={Package} message="No has creado ninguna publicación" actionLabel="Crear Primera Publicación" actionHref="/crear-publicacion" />
            ) : (
              <div className="space-y-4">
                {misPublicaciones.map((pub: any) => {
                  const totalUnidades = pub.totalUnidades || 0;
                  const porcentaje = Math.min(100, (totalUnidades / pub.meta_unidades) * 100);

                  return (
                    <Link key={pub.id_publicacion} href={`/producto/${pub.id_publicacion}`} className="block">
                      <Card className="p-5 hover:shadow-lg transition-shadow">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-bold text-lg text-foreground">{pub.titulo}</h3>
                              <Badge variant={pub.estado === "ACTIVA" ? "success" : "accent"}>
                                {pub.estado === "ACTIVA" ? "Activa" : "Meta Alcanzada"}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="font-extrabold text-xl text-primary">${pub.precio_mayoreo.toString()}</span>
                              <span>Meta: {pub.meta_unidades} uds</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(pub.fecha_limite).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="w-full md:w-48">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>{totalUnidades} pedidas</span>
                              <span>{porcentaje.toFixed(0)}%</span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${porcentaje}%` }}></div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="resenas">
            {resenasRecibidas.length === 0 ? (
              <EmptyState icon={Star} message="No tienes reseñas todavía" />
            ) : (
              <div className="space-y-4">
                {resenasRecibidas.map((r: any) => (
                  <Card key={r.id_resena} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {r.resena_de?.nombre || "Anónimo"}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < r.calificacion
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                          <span className="text-xs text-gray-400 ml-2">
                            {new Date(r.fecha_creacion).toLocaleDateString()}
                          </span>
                        </div>
                        {r.comentario && (
                          <p className="text-sm text-gray-600 mt-2">{r.comentario}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 md:hidden">
        <div className="flex justify-around">
          <Link href="/dashboard" className="flex flex-col items-center text-muted-foreground">
            <ShoppingCart className="w-6 h-6" />
            <span className="text-xs">Inicio</span>
          </Link>
          <Link href="/perfil" className="flex flex-col items-center text-primary">
            <User className="w-6 h-6" />
            <span className="text-xs">Perfil</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function CompraCard({ part, estadoBadge, badgeVariant }: { part: any; estadoBadge: string; badgeVariant: "success" | "accent" | "secondary" }) {
  return (
    <Card className="p-5 hover:shadow-lg transition-shadow">
      <Link href={`/producto/${part.publicacion.id_publicacion}`} className="block">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-bold text-lg text-foreground">{part.publicacion.titulo}</h3>
              <Badge variant={badgeVariant}>{estadoBadge}</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Creador: {part.publicacion.creador.nombre}</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {part.publicacion.creador.localidad}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-extrabold text-primary">{part.cantidad}</div>
            <div className="text-xs text-muted-foreground">unidades</div>
          </div>
        </div>
      </Link>
      {badgeVariant === "accent" && part.publicacion?.creador?.id_usuario && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <WriteReviewButton
            usuarioId={part.publicacion.creador.id_usuario}
            usuarioNombre={part.publicacion.creador.nombre}
          />
        </div>
      )}
    </Card>
  );
}

function EmptyState({ icon: Icon, message, actionLabel, actionHref }: { icon: any; message: string; actionLabel?: string; actionHref?: string }) {
  return (
    <div className="text-center py-16 bg-muted/30 rounded-xl border border-dashed">
      <Icon className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
      <p className="text-muted-foreground font-medium text-lg">{message}</p>
      {actionLabel && actionHref && (
        <Button asChild variant="default" className="mt-4">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
}
