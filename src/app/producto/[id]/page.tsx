// app/producto/[id]/page.tsx
import { obtenerPublicacionPorId } from "@/app/actions/publicaciones";
import { obtenerSolicitudesCreador } from "@/app/actions/participaciones";
import { obtenerPostsCoordinacion } from "@/app/actions/coordinacion";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import GaleriaInteractiva from "@/components/producto/GaleriaInteractiva"; 
import { JoinOrderButton } from "@/components/producto/JoinOrderButton";
import { ReputationBadge } from "@/components/ReputationBadge";
import { RequestsList } from "@/components/RequestsList";
import { CoordinationFeed } from "@/components/CoordinationFeed";
import { CoordinationSpaceForm } from "@/components/CoordinationSpaceForm";
import { Header } from "@/components/ui/Header";
import { ShoppingCart, ChevronRight, MapPin, ExternalLink, CalendarDays, Users, MessageCircle, ArrowRight, Lock } from "lucide-react";

export default async function DetalleProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const id_publicacion = parseInt(id);
  const session = await getServerSession(authOptions);
  const res = await obtenerPublicacionPorId(id_publicacion);

  if (res.error || !res.publicacion) {
    notFound(); 
  }

  const { publicacion: producto, images, totalUnidades } = res;

  const porcentajeProgreso = Math.min(100, (totalUnidades / producto.meta_unidades) * 100);
  const unidadesFaltantes = Math.max(0, producto.meta_unidades - totalUnidades);
  const esCreador = session?.user?.id === producto.creador_id.toString();

  // Participation status for current user
  let yaUnido = false;
  let estadoParticipacion: string | undefined;
  let esAprobado = false;

  if (session?.user?.id && !esCreador) {
    const miParticipacion = await prisma.participacion.findFirst({
      where: {
        usuario_id: parseInt(session.user.id),
        publicacion_id: id_publicacion,
      },
      select: { estado: true },
    });
    if (miParticipacion) {
      yaUnido = true;
      estadoParticipacion = miParticipacion.estado;
      esAprobado = miParticipacion.estado === "APPROVED";
    }
  }

  // Fetch pending requests if creator
  let solicitudesPendientes: any[] = [];
  if (esCreador) {
    const result = await obtenerSolicitudesCreador();
    if (result.success) {
      solicitudesPendientes = (result.solicitudes || []).filter(
        (s: any) => s.publicacion_id === id_publicacion
      );
    }
  }

  const whatsappLink = producto.creador.telefono 
    ? `https://wa.me/${producto.creador.telefono.replace(/\D/g, '')}?text=Hola, me interesa unirme a la compra grupal de ${producto.titulo}`
    : null;

  // Get coordination posts if user is approved or is creator
  let postsCoordinacion: any[] = [];
  if (esAprobado || esCreador) {
    const postsRes = await obtenerPostsCoordinacion(id_publicacion);
    if (postsRes.success) {
      postsCoordinacion = postsRes.posts || [];
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <Header session={session as any} />

      <div className="max-w-7xl mx-auto py-10 px-6">
        
        {/* Breadcrumbs */}
        <div className="text-sm font-medium text-gray-500 mb-10 flex items-center gap-2">
          <Link href="/dashboard" className="hover:text-[#A855F7] transition-colors">Inicio</Link> 
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 truncate">{producto.titulo}</span>
        </div>

        {/* Layout Principal (2 Columnas) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          
          {/* Columna Izquierda: Galería Interactiva */}
          <div>
            <GaleriaInteractiva images={images} />
          </div>

          {/* Columna Derecha: Información y Acciones */}
          <div className="flex flex-col">
            
            {/* Título y Creador */}
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-3 tracking-tight">
              {producto.titulo}
            </h1>
            
            <div className="flex items-center gap-2 text-gray-500 font-medium mb-6 flex-wrap">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>Creado por <span className="text-gray-700 font-semibold">{producto.creador.nombre}</span> ({producto.creador.localidad})</span>
              <ReputationBadge
                calificacion={Number(producto.creador.calificacion_promedio)}
                comprasCompletadas={producto.creador.compras_completadas}
              />
            </div>

            {/* Precio */}
            <div className="flex items-end gap-3 mb-8 pb-8 border-b border-gray-100">
              <span className="text-gray-400 line-through text-lg font-medium">${producto.precio_unitario.toString()}</span>
              <span className="text-5xl font-extrabold text-gray-900 tracking-tight">${producto.precio_mayoreo.toString()}</span>
              <span className="text-xs font-bold text-[#A855F7] mb-2 px-2.5 py-1 bg-purple-50 rounded-md border border-purple-100 uppercase tracking-wider">
                Precio Meta
              </span>
            </div>

            {/* SECCIÓN CRÍTICA DE WEBUY: Meta y Progreso */}
            <div className="bg-[#fcfcfc] p-6 rounded-xl mb-10 border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center text-sm font-semibold text-gray-600 mb-3">
                <span>Progreso de la meta</span>
                <span className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-md text-gray-700">
                  <CalendarDays className="w-4 h-4 text-gray-500" />
                  Cierra: {producto.fecha_limite.toLocaleDateString()}
                </span>
              </div>
              
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mb-4">
                <div 
                  className="h-full bg-[#A855F7] transition-all duration-700 ease-out rounded-full" 
                  style={{ width: `${porcentajeProgreso}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-900 text-3xl font-extrabold tracking-tight">{totalUnidades} <span className="text-lg text-gray-500 font-medium">pedidas</span></span>
                <div className="text-right flex flex-col">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Meta</span>
                  <span className="text-2xl text-[#CFA144] font-bold">{producto.meta_unidades} <span className="text-base font-medium">uds</span></span>
                </div>
              </div>

              {unidadesFaltantes > 0 && (
                 <div className="mt-5 text-center bg-purple-50 text-purple-900 text-sm font-semibold p-3 rounded-lg border border-purple-100">
                   ¡Faltan solo <span className="text-[#A855F7] font-extrabold">{unidadesFaltantes} unidades</span> para el descuento!
                 </div>
              )}
            </div>

            {/* Botones de Acción */}
            <div className="flex flex-col gap-4">
              
              {producto.estado === "META_ALCANZADA" ? (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
                  <h3 className="text-xl font-bold text-green-700 mb-2">Meta Alcanzada</h3>
                  <p className="text-green-600 font-medium">La compra grupal se ha completado. Ahora puedes coordinar la entrega y pago.</p>
                </div>
              ) : (
                <JoinOrderButton
                  publicacionId={id_publicacion}
                  esCreador={esCreador}
                  yaUnido={yaUnido}
                  estadoParticipacion={estadoParticipacion}
                  unidadesFaltantes={unidadesFaltantes}
                />
              )}

              {esCreador && solicitudesPendientes.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <h4 className="font-semibold text-yellow-900 mb-3 text-sm">
                    Solicitudes pendientes ({solicitudesPendientes.length})
                  </h4>
                  <RequestsList solicitudes={solicitudesPendientes} />
                </div>
              )}
              
              {whatsappLink && (
                <a 
                  href={whatsappLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold py-4 px-6 rounded-full transition-all text-lg shadow-md flex items-center justify-center gap-3"
                >
                  <MessageCircle className="w-5 h-5" />
                  Contactar al creador por WhatsApp
                </a>
              )}
            </div>

            {/* Sección de Participantes */}
            {producto.participaciones.length > 0 && (
              <div className="mt-10 pt-8 border-t border-gray-100">
                <h4 className="font-extrabold text-xl mb-6 text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#A855F7]" />
                  Participantes ({producto.participaciones.length})
                </h4>
                <div className="space-y-3">
                  {producto.participaciones.map((participacion, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#A855F7] text-white flex items-center justify-center font-bold">
                          {participacion.usuario.nombre.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">
                          {esCreador ? participacion.usuario.nombre : `Participante ${idx + 1}`}
                        </span>
                      </div>
                      <span className="font-bold text-[#A855F7]">{participacion.cantidad} uds</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Total comprometido</span>
                  <span className="text-2xl font-extrabold text-gray-900">{totalUnidades} uds</span>
                </div>
              </div>
            )}

            {/* Descripción */}
            <div className="mt-12 pt-8 border-t border-gray-100 text-gray-700 leading-relaxed">
              <h4 className="font-extrabold text-xl mb-4 text-gray-900 tracking-tight">Descripción del producto</h4>
              <p className="text-gray-600 font-medium whitespace-pre-line">{producto.descripcion}</p>
              
              {producto.url_origen && (
                 <a href={producto.url_origen} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[#A855F7] hover:text-purple-800 font-semibold mt-5 transition-colors">
                    Ver fuente original <ExternalLink className="w-4 h-4" />
                 </a>
              )}
            </div>

          </div>
        </div>

        {/* Espacio de Coordinación Integrado */}
        <div className="max-w-4xl mx-auto mt-16 pt-10 border-t border-gray-200 px-6 pb-16">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-[#A855F7]" />
            Espacio de Coordinación
          </h2>
          <p className="text-gray-500 mb-8">
            Coordina entregas, pagos y acuerdos con los participantes de esta compra.
          </p>

          {!session?.user?.id ? (
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-10 text-center">
              <Lock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Inicia sesión para acceder al espacio de coordinación.</p>
            </div>
          ) : esCreador ? (
            <div>
              <div className="mb-8">
                <CoordinationSpaceForm publicacionId={id_publicacion} />
              </div>
              <CoordinationFeed posts={postsCoordinacion} publicacionId={id_publicacion} currentUserId={parseInt(session.user.id)} />
            </div>
          ) : !yaUnido ? (
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-10 text-center">
              <Lock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Únete a esta compra para acceder al espacio de coordinación.</p>
            </div>
          ) : estadoParticipacion === "PENDING" ? (
            <div className="bg-yellow-50 border-2 border-dashed border-yellow-200 rounded-xl p-10 text-center">
              <Lock className="w-12 h-12 text-yellow-300 mx-auto mb-3" />
              <p className="text-yellow-700 font-medium">
                Tu solicitud está pendiente de aprobación. Espera a que el creador la apruebe.
              </p>
            </div>
          ) : estadoParticipacion === "REJECTED" ? (
            <div className="bg-red-50 border-2 border-dashed border-red-200 rounded-xl p-10 text-center">
              <Lock className="w-12 h-12 text-red-300 mx-auto mb-3" />
              <p className="text-red-700 font-medium">
                Tu solicitud fue rechazada. No tienes acceso al espacio de coordinación.
              </p>
            </div>
          ) : (
            <div>
              <div className="mb-8">
                <CoordinationSpaceForm publicacionId={id_publicacion} />
              </div>
              <CoordinationFeed posts={postsCoordinacion} publicacionId={id_publicacion} currentUserId={parseInt(session.user.id)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}