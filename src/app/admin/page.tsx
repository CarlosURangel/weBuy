"use client";

import { useState } from "react";
import { Shield, Flag, Star, Users, AlertTriangle, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { obtenerReportes, actualizarEstadoReporte, aplicarPenalizacion, quitarPenalizacion, obtenerTodasResenas, eliminarResenaAdmin, obtenerUsuarios } from "@/app/actions/admin";
import { useEffect } from "react";

type Tab = "reportes" | "resenas" | "usuarios";

const razonLabel: Record<string, string> = {
  FRAUDE: "Fraude", SPAM: "Spam", COMPORTAMIENTO_INAPROPIADO: "Comportamiento inapropiado", OTRO: "Otro",
};

const estadoColor: Record<string, string> = {
  PENDIENTE: "bg-yellow-100 text-yellow-700", REVISADO: "bg-blue-100 text-blue-700", RESUELTO: "bg-green-100 text-green-700",
};

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("reportes");

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Shield className="w-7 h-7 text-[#2D1340]" />
        <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
      </div>

      <div className="flex gap-3 mb-8">
        {([
          { key: "reportes" as Tab, label: "Reportes", icon: Flag },
          { key: "resenas" as Tab, label: "Reseñas", icon: Star },
          { key: "usuarios" as Tab, label: "Usuarios", icon: Users },
        ]).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === key ? "bg-[#2D1340] text-white shadow" : "bg-white text-gray-600 hover:bg-gray-100 border"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === "reportes" && <ReportesTab />}
      {tab === "resenas" && <ResenasTab />}
      {tab === "usuarios" && <UsuariosTab />}
    </div>
  );
}

function ReportesTab() {
  const [reportes, setReportes] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargar = async () => {
    const res = await obtenerReportes();
    if (res.success) { setReportes(res.reportes || []); }
    else { toast.error(res.error || "Error"); }
    setCargando(false);
  };

  useEffect(() => { cargar(); }, []);

  const handleEstado = async (id: number, estado: string) => {
    const res = await actualizarEstadoReporte(id, estado);
    if (res.success) { toast.success(`Reporte marcado como ${estado}`); cargar(); }
    else { toast.error(res.error || "Error"); }
  };

  const handlePenalizar = async (usuarioId: number) => {
    const res = await aplicarPenalizacion(usuarioId, 7);
    if (res.success) { toast.success(res.message); cargar(); }
    else { toast.error(res.error || "Error"); }
  };

  const handleQuitar = async (usuarioId: number) => {
    const res = await quitarPenalizacion(usuarioId);
    if (res.success) { toast.success(res.message); cargar(); }
    else { toast.error(res.error || "Error"); }
  };

  if (cargando) return <Loading />;

  const pendientes = reportes.filter(r => r.estado === "PENDIENTE");
  const revisados = reportes.filter(r => r.estado !== "PENDIENTE");

  return (
    <div className="space-y-4">
      {reportes.length === 0 ? (
        <Card className="p-12 text-center"><Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500 font-medium">No hay reportes</p></Card>
      ) : (
        <>
          {pendientes.map(r => <ReporteCard key={r.id_reporte} r={r} onEstado={handleEstado} onPenalizar={handlePenalizar} onQuitar={handleQuitar} />)}
          {revisados.length > 0 && <h2 className="text-lg font-semibold text-gray-800 mt-6 mb-3">Revisados</h2>}
          {revisados.map(r => <ReporteCard key={r.id_reporte} r={r} onEstado={handleEstado} onPenalizar={handlePenalizar} onQuitar={handleQuitar} />)}
        </>
      )}
    </div>
  );
}

function ReporteCard({ r, onEstado, onPenalizar, onQuitar }: { r: any; onEstado: (id: number, e: string) => void; onPenalizar: (id: number) => void; onQuitar: (id: number) => void }) {
  const penalizado = r.reportado?.penalizado_hasta && new Date(r.reportado.penalizado_hasta) > new Date();
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={estadoColor[r.estado]}>{r.estado}</Badge>
            <Badge className="bg-purple-100 text-purple-700">{razonLabel[r.razon] || r.razon}</Badge>
          </div>
          <p className="text-sm"><span className="text-gray-500">De:</span> <span className="font-medium">{r.reportero?.nombre}</span> <span className="text-gray-400 mx-1">→</span> <span className="font-medium">{r.reportado?.nombre}</span>{penalizado && <Badge className="ml-2 bg-red-100 text-red-700 text-[10px]">Penalizado</Badge>}</p>
          <p className="text-xs text-gray-400">{new Date(r.fecha_reporte).toLocaleString()}</p>
          {r.descripcion && <p className="text-sm text-gray-600 mt-2 bg-gray-50 rounded p-2">{r.descripcion}</p>}
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          {r.estado === "PENDIENTE" ? (
            <>
              <Button size="sm" variant="outline" onClick={() => onEstado(r.id_reporte, "REVISADO")}><Check className="w-3.5 h-3.5 mr-1" />Revisado</Button>
              <Button size="sm" variant="outline" onClick={() => onPenalizar(r.reportado.id_usuario)}><AlertTriangle className="w-3.5 h-3.5 mr-1" />Penalizar 7d</Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="outline" onClick={() => onEstado(r.id_reporte, "PENDIENTE")}>Reabrir</Button>
              {penalizado ? (
                <Button size="sm" variant="outline" onClick={() => onQuitar(r.reportado.id_usuario)}><X className="w-3.5 h-3.5 mr-1" />Quitar penalización</Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => onPenalizar(r.reportado.id_usuario)}><AlertTriangle className="w-3.5 h-3.5 mr-1" />Penalizar</Button>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

function ResenasTab() {
  const [resenas, setResenas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargar = async () => {
    const res = await obtenerTodasResenas();
    if (res.success) { setResenas(res.resenas || []); }
    else { toast.error(res.error || "Error"); }
    setCargando(false);
  };

  useEffect(() => { cargar(); }, []);

  const handleEliminar = async (id: number) => {
    if (!confirm("¿Eliminar esta reseña?")) return;
    const res = await eliminarResenaAdmin(id);
    if (res.success) { toast.success("Reseña eliminada"); cargar(); }
    else { toast.error(res.error || "Error"); }
  };

  if (cargando) return <Loading />;

  return (
    <div className="space-y-3">
      {resenas.length === 0 ? (
        <Card className="p-12 text-center"><p className="text-gray-500 font-medium">No hay reseñas</p></Card>
      ) : resenas.map((r: any) => (
        <Card key={r.id_resena} className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-900">{r.resena_de?.nombre}</span>
                <span className="text-gray-400">→</span>
                <span className="font-semibold text-gray-900">{r.resena_a?.nombre}</span>
                <div className="flex items-center gap-0.5 ml-2">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < r.calificacion ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-400">{new Date(r.fecha_creacion).toLocaleString()}</p>
              {r.comentario && <p className="text-sm text-gray-600 mt-1">{r.comentario}</p>}
            </div>
            <Button size="sm" variant="outline" className="text-red-500 hover:text-red-700" onClick={() => handleEliminar(r.id_resena)}><X className="w-4 h-4" /></Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

function UsuariosTab() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargar = async () => {
    const res = await obtenerUsuarios();
    if (res.success) { setUsuarios(res.usuarios || []); }
    else { toast.error(res.error || "Error"); }
    setCargando(false);
  };

  useEffect(() => { cargar(); }, []);

  const handlePenalizar = async (id: number) => {
    const diasStr = prompt("Días de penalización:", "7");
    if (!diasStr) return;
    const dias = parseInt(diasStr);
    if (isNaN(dias) || dias < 1) { toast.error("Número inválido"); return; }
    const res = await aplicarPenalizacion(id, dias);
    if (res.success) { toast.success(res.message); cargar(); }
    else { toast.error(res.error || "Error"); }
  };

  const handleQuitar = async (id: number) => {
    const res = await quitarPenalizacion(id);
    if (res.success) { toast.success(res.message); cargar(); }
    else { toast.error(res.error || "Error"); }
  };

  if (cargando) return <Loading />;

  return (
    <div className="space-y-3">
      {usuarios.map((u: any) => {
        const penalizado = u.penalizado_hasta && new Date(u.penalizado_hasta) > new Date();
        return (
          <Card key={u.id_usuario} className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">{u.nombre}</span>
                  {u.rol === "ADMINISTRADOR" && <Badge className="bg-purple-100 text-purple-700"><Shield className="w-3 h-3 mr-0.5" />Admin</Badge>}
                  {u.rol === "COMPRADOR" && <Badge className="bg-blue-100 text-blue-700">Comprador</Badge>}
                  {penalizado && <Badge className="bg-red-100 text-red-700">Penalizado hasta {new Date(u.penalizado_hasta).toLocaleDateString()}</Badge>}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{u.correo}</span>
                  <span>{u.localidad}</span>
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />{Number(u.calificacion_promedio).toFixed(1)}</span>
                  <span>{u.compras_completadas} compras</span>
                  {u._count?.reportes_recibidos > 0 && <span className="text-red-500">{u._count.reportes_recibidos} reportes</span>}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                {penalizado ? (
                  <Button size="sm" variant="outline" onClick={() => handleQuitar(u.id_usuario)}><X className="w-3.5 h-3.5 mr-1" />Quitar penalización</Button>
                ) : u.rol !== "ADMINISTRADOR" && (
                  <Button size="sm" variant="outline" onClick={() => handlePenalizar(u.id_usuario)}><AlertTriangle className="w-3.5 h-3.5 mr-1" />Penalizar</Button>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function Loading() {
  return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2D1340]"></div></div>;
}
