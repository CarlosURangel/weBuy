"use client";

import { useState } from "react";
import { crearComentarioCoordinacion, eliminarPostCoordinacion, editarPostCoordinacion, eliminarComentarioCoordinacion, editarComentarioCoordinacion } from "@/app/actions/coordinacion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { MessageCircle, Pencil, Trash2, Star, X, Check } from "lucide-react";

interface AutorData {
  nombre: string;
  id_usuario: number;
  calificacion_promedio?: number;
}

interface ComentarioData {
  id_comentario: number;
  contenido: string;
  fecha_creacion: Date;
  autor: AutorData;
}

interface CoordinationPostData {
  id_post: number;
  titulo: string;
  contenido: string;
  tipo: string;
  fecha_creacion: Date;
  autor: AutorData;
  comentarios: ComentarioData[];
}

interface CoordinationFeedProps {
  posts: CoordinationPostData[];
  publicacionId: number;
  currentUserId?: number;
}

const tiposConfig: Record<string, { color: string; label: string }> = {
  GENERAL: { color: "bg-blue-100 text-blue-700", label: "General" },
  UBICACION: { color: "bg-purple-100 text-purple-700", label: "Ubicación" },
  PAGO: { color: "bg-green-100 text-green-700", label: "Pago" },
  ACUERDO: { color: "bg-orange-100 text-orange-700", label: "Acuerdo" },
  ANUNCIO: { color: "bg-red-100 text-red-700", label: "Anuncio" },
};

function ReputationBadge({ rating }: { rating?: number }) {
  if (rating === undefined || rating === null) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-yellow-600 ml-2">
      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
      {rating.toFixed(1)}
    </span>
  );
}

export function CoordinationFeed({ posts, publicacionId, currentUserId }: CoordinationFeedProps) {
  const [expandedPost, setExpandedPost] = useState<number | null>(null);
  const [comentario, setComentario] = useState<Record<number, string>>({});
  const [procesando, setProcesando] = useState<number | null>(null);
  const [editandoPost, setEditandoPost] = useState<number | null>(null);
  const [editandoComentario, setEditandoComentario] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{ titulo: string; contenido: string; tipo: string }>({ titulo: "", contenido: "", tipo: "GENERAL" });
  const [editComentarioText, setEditComentarioText] = useState("");

  const handleAgregarComentario = async (postId: number) => {
    const contenido = comentario[postId]?.trim();
    if (!contenido) {
      toast.error("El comentario no puede estar vacío");
      return;
    }

    setProcesando(postId);
    try {
      const formData = new FormData();
      formData.append("post_id", postId.toString());
      formData.append("contenido", contenido);

      const result = await crearComentarioCoordinacion(formData);

      if (result.success) {
        toast.success("Comentario publicado");
        setComentario((prev) => ({ ...prev, [postId]: "" }));
      } else {
        toast.error(result.error || "Error al publicar comentario");
      }
    } catch {
      toast.error("Error al publicar comentario");
    } finally {
      setProcesando(null);
    }
  };

  const handleEliminarPost = async (postId: number) => {
    if (!confirm("¿Eliminar este post y todos sus comentarios?")) return;
    const result = await eliminarPostCoordinacion(postId);
    if (result.success) {
      toast.success("Post eliminado");
    } else {
      toast.error(result.error || "Error al eliminar post");
    }
  };

  const handleIniciarEditarPost = (post: CoordinationPostData) => {
    setEditandoPost(post.id_post);
    setEditForm({ titulo: post.titulo, contenido: post.contenido, tipo: post.tipo });
  };

  const handleGuardarEditarPost = async (postId: number) => {
    if (editForm.titulo.length < 3) { toast.error("El título debe tener al menos 3 caracteres"); return; }
    if (editForm.contenido.length < 5) { toast.error("El contenido debe tener al menos 5 caracteres"); return; }
    const result = await editarPostCoordinacion(postId, editForm.titulo, editForm.contenido, editForm.tipo);
    if (result.success) {
      toast.success("Post actualizado");
      setEditandoPost(null);
    } else {
      toast.error(result.error || "Error al editar post");
    }
  };

  const handleEliminarComentario = async (comentarioId: number) => {
    if (!confirm("¿Eliminar este comentario?")) return;
    const result = await eliminarComentarioCoordinacion(comentarioId);
    if (result.success) {
      toast.success("Comentario eliminado");
    } else {
      toast.error(result.error || "Error al eliminar comentario");
    }
  };

  const handleIniciarEditarComentario = (c: ComentarioData) => {
    setEditandoComentario(c.id_comentario);
    setEditComentarioText(c.contenido);
  };

  const handleGuardarEditarComentario = async (comentarioId: number) => {
    if (!editComentarioText.trim()) { toast.error("El comentario no puede estar vacío"); return; }
    const result = await editarComentarioCoordinacion(comentarioId, editComentarioText);
    if (result.success) {
      toast.success("Comentario actualizado");
      setEditandoComentario(null);
    } else {
      toast.error(result.error || "Error al editar comentario");
    }
  };

  if (posts.length === 0) {
    return (
      <Card className="p-8 text-center bg-gray-50">
        <MessageCircle className="mx-auto mb-2 text-gray-400" size={32} />
        <p className="text-gray-600">No hay mensajes aún. ¡Sé el primero en publicar!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => {
        const config = tiposConfig[post.tipo] || tiposConfig.GENERAL;
        const isExpanded = expandedPost === post.id_post;
        const esAutor = currentUserId === post.autor.id_usuario;

        return (
          <Card key={post.id_post} className="overflow-hidden">
            <div className="w-full text-left p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <button
                  onClick={() => setExpandedPost(isExpanded ? null : post.id_post)}
                  className="flex-1 min-w-0 text-left"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={config.color}>
                      {config.label}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(post.fecha_creacion).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900 break-words">
                    {post.titulo}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1 flex items-center">
                    Por <span className="font-medium ml-1">{post.autor.nombre}</span>
                    <ReputationBadge rating={post.autor.calificacion_promedio} />
                  </p>
                </button>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {esAutor && (
                    <>
                      <button
                        onClick={() => handleIniciarEditarPost(post)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEliminarPost(post.id_post)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <span className="text-gray-400 text-xl ml-1">
                    {isExpanded ? "−" : "+"}
                  </span>
                </div>
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-4">
                {editandoPost === post.id_post ? (
                  <div className="bg-white rounded border border-gray-200 p-3 space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-sm text-gray-900">Editar post</h5>
                      <button
                        onClick={() => setEditandoPost(null)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <select
                      value={editForm.tipo}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, tipo: e.target.value }))}
                      className="w-full text-sm border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {Object.entries(tiposConfig).map(([key, val]) => (
                        <option key={key} value={key}>{val.label}</option>
                      ))}
                    </select>
                    <Input
                      value={editForm.titulo}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, titulo: e.target.value }))}
                      placeholder="Título"
                      className="text-sm"
                    />
                    <Textarea
                      value={editForm.contenido}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, contenido: e.target.value }))}
                      placeholder="Contenido"
                      rows={4}
                      className="text-sm"
                    />
                    <Button size="sm" onClick={() => handleGuardarEditarPost(post.id_post)} className="w-full">
                      <Check className="w-4 h-4 mr-1" /> Guardar cambios
                    </Button>
                  </div>
                ) : (
                  <p className="text-gray-700 whitespace-pre-wrap">{post.contenido}</p>
                )}

                {post.comentarios.length > 0 && (
                  <div className="bg-white rounded border border-gray-200 p-3 space-y-3">
                    <h5 className="font-medium text-sm text-gray-900">
                      Comentarios ({post.comentarios.length})
                    </h5>
                    {post.comentarios.map((comentario) => {
                      const esAutorComentario = currentUserId === comentario.autor.id_usuario;
                      return (
                        <div
                          key={comentario.id_comentario}
                          className="border-l-2 border-blue-200 pl-3 group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="text-xs font-medium text-gray-900 flex items-center">
                                {comentario.autor.nombre}
                                <ReputationBadge rating={comentario.autor.calificacion_promedio} />
                              </p>
                              <p className="text-xs text-gray-500 mb-1">
                                {new Date(comentario.fecha_creacion).toLocaleString()}
                              </p>
                            </div>
                            {esAutorComentario && (
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleIniciarEditarComentario(comentario)}
                                  className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                  title="Editar"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleEliminarComentario(comentario.id_comentario)}
                                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                          {editandoComentario === comentario.id_comentario ? (
                            <div className="space-y-2 mt-1">
                              <Textarea
                                value={editComentarioText}
                                onChange={(e) => setEditComentarioText(e.target.value)}
                                rows={2}
                                className="text-sm"
                              />
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleGuardarEditarComentario(comentario.id_comentario)}>
                                  <Check className="w-3 h-3 mr-1" /> Guardar
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setEditandoComentario(null)}>
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-700">{comentario.contenido}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="bg-white rounded border border-gray-200 p-3 space-y-2">
                  <Textarea
                    placeholder="Agregar un comentario..."
                    value={comentario[post.id_post] || ""}
                    onChange={(e) =>
                      setComentario((prev) => ({
                        ...prev,
                        [post.id_post]: e.target.value,
                      }))
                    }
                    rows={2}
                    className="text-sm"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleAgregarComentario(post.id_post)}
                    disabled={procesando === post.id_post}
                    className="w-full"
                  >
                    {procesando === post.id_post ? "Publicando..." : "Comentar"}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
