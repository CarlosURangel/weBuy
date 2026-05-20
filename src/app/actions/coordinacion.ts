"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const CoordinationPostSchema = z.object({
  publicacion_id: z.coerce.number().int().positive(),
  titulo: z.string().min(3, "El título es muy corto").max(200),
  contenido: z.string().min(5, "El contenido es muy corto"),
  tipo: z.enum(["GENERAL", "UBICACION", "PAGO", "ACUERDO", "ANUNCIO"]),
});

const CoordinationCommentSchema = z.object({
  post_id: z.coerce.number().int().positive(),
  contenido: z.string().min(1, "El comentario no puede estar vacío"),
});

export async function crearPostCoordinacion(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "No autorizado" };

  const rawData = Object.fromEntries(formData.entries());
  const validation = CoordinationPostSchema.safeParse(rawData);

  if (!validation.success) {
    return { errors: validation.error.flatten().fieldErrors };
  }

  try {
    const data = validation.data;
    const usuarioId = parseInt(session.user.id);

    const publicacion = await prisma.publicacion.findUnique({
      where: { id_publicacion: data.publicacion_id },
    });

    if (!publicacion) {
      return { error: "La publicación no existe" };
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: usuarioId },
      select: { penalizado_hasta: true },
    });

    if (usuario?.penalizado_hasta && new Date(usuario.penalizado_hasta) > new Date()) {
      return { error: "No puedes publicar mientras tengas una penalización activa" };
    }

    const esCreador = publicacion.creador_id === usuarioId;

    if (!esCreador) {
      const participacion = await prisma.participacion.findFirst({
        where: {
          usuario_id: usuarioId,
          publicacion_id: data.publicacion_id,
        },
        select: {
          id_participacion: true,
          estado: true,
        },
      });

      if (!participacion || participacion.estado !== "APPROVED") {
        return { error: "No tienes acceso a este espacio de coordinación" };
      }
    }

    await prisma.coordinationPost.create({
      data: {
        publicacion_id: data.publicacion_id,
        autor_id: usuarioId,
        titulo: data.titulo,
        contenido: data.contenido,
        tipo: data.tipo,
      },
    });

    revalidatePath(`/producto/${data.publicacion_id}`);
    return { success: true };
  } catch (error) {
    console.error("Error al crear post:", error);
    return { error: "Error al crear post" };
  }
}

export async function crearComentarioCoordinacion(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "No autorizado" };

  const rawData = Object.fromEntries(formData.entries());
  const validation = CoordinationCommentSchema.safeParse(rawData);

  if (!validation.success) {
    return { errors: validation.error.flatten().fieldErrors };
  }

  try {
    const data = validation.data;
    const usuarioId = parseInt(session.user.id);

    const post = await prisma.coordinationPost.findUnique({
      where: { id_post: data.post_id },
      include: { publicacion: true },
    });

    if (!post) {
      return { error: "El post no existe" };
    }

    const esCreador = post.publicacion.creador_id === usuarioId;

    if (!esCreador) {
      const participacion = await prisma.participacion.findFirst({
        where: {
          usuario_id: usuarioId,
          publicacion_id: post.publicacion_id,
        },
      });

      if (!participacion || participacion.estado !== "APPROVED") {
        return { error: "No tienes acceso a este espacio" };
      }
    }

    await prisma.coordinationComment.create({
      data: {
        post_id: data.post_id,
        autor_id: usuarioId,
        contenido: data.contenido,
      },
    });

    revalidatePath(`/producto/${post.publicacion_id}`);
    return { success: true };
  } catch (error) {
    console.error("Error al crear comentario:", error);
    return { error: "Error al crear comentario" };
  }
}

export async function obtenerPostsCoordinacion(publicacionId: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "No autorizado" };

  try {
    const usuarioId = parseInt(session.user.id);

    const publicacion = await prisma.publicacion.findUnique({
      where: { id_publicacion: publicacionId },
    });

    if (!publicacion) {
      return { error: "La publicación no existe" };
    }

    const esCreador = publicacion.creador_id === usuarioId;
    if (!esCreador) {
      const participacion = await prisma.participacion.findFirst({
        where: {
          usuario_id: usuarioId,
          publicacion_id: publicacionId,
        },
      });

      if (!participacion || participacion.estado !== "APPROVED") {
        return { error: "No tienes acceso a este espacio" };
      }
    }

    const posts = await prisma.coordinationPost.findMany({
      where: { publicacion_id: publicacionId },
      include: {
        autor: true,
        comentarios: {
          include: { autor: true },
          orderBy: { fecha_creacion: "asc" },
        },
      },
      orderBy: { fecha_creacion: "desc" },
    });

    const serializarAutor = (u: any) => u ? { ...u, calificacion_promedio: Number(u.calificacion_promedio) } : u;
    const postsPlanos = posts.map((p) => ({
      ...p,
      autor: serializarAutor(p.autor),
      comentarios: p.comentarios.map((c) => ({
        ...c,
        autor: serializarAutor(c.autor),
      })),
    }));

    return { success: true, posts: postsPlanos };
  } catch (error) {
    console.error("Error al obtener posts:", error);
    return { error: "Error al obtener posts" };
  }
}

export async function obtenerComentariosPost(postId: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "No autorizado" };

  try {
    const usuarioId = parseInt(session.user.id);

    const post = await prisma.coordinationPost.findUnique({
      where: { id_post: postId },
      include: { publicacion: true },
    });

    if (!post) {
      return { error: "El post no existe" };
    }

    const esCreador = post.publicacion.creador_id === usuarioId;
    if (!esCreador) {
      const participacion = await prisma.participacion.findFirst({
        where: {
          usuario_id: usuarioId,
          publicacion_id: post.publicacion_id,
        },
      });

      if (!participacion || participacion.estado !== "APPROVED") {
        return { error: "No tienes acceso a este espacio" };
      }
    }

    const comentarios = await prisma.coordinationComment.findMany({
      where: { post_id: postId },
      include: { autor: true },
      orderBy: { fecha_creacion: "asc" },
    });

    const comentariosPlanos = comentarios.map((c) => ({
      ...c,
      autor: c.autor ? { ...c.autor, calificacion_promedio: Number(c.autor.calificacion_promedio) } : c.autor,
    }));

    return { success: true, comentarios: comentariosPlanos };
  } catch (error) {
    console.error("Error al obtener comentarios:", error);
    return { error: "Error al obtener comentarios" };
  }
}

export async function eliminarPostCoordinacion(postId: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "No autorizado" };

  try {
    const usuarioId = parseInt(session.user.id);

    const post = await prisma.coordinationPost.findUnique({
      where: { id_post: postId },
      include: { publicacion: true },
    });

    if (!post) {
      return { error: "El post no existe" };
    }

    const esAutor = post.autor_id === usuarioId;
    const esCreador = post.publicacion.creador_id === usuarioId;

    if (!esAutor && !esCreador) {
      return { error: "No tienes permiso para eliminar este post" };
    }

    await prisma.coordinationPost.delete({
      where: { id_post: postId },
    });

    revalidatePath(`/producto/${post.publicacion_id}`);
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar post:", error);
    return { error: "Error al eliminar post" };
  }
}

export async function editarPostCoordinacion(postId: number, titulo: string, contenido: string, tipo: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "No autorizado" };

  if (titulo.length < 3 || titulo.length > 200) {
    return { error: "El título debe tener entre 3 y 200 caracteres" };
  }
  if (contenido.length < 5) {
    return { error: "El contenido debe tener al menos 5 caracteres" };
  }

  try {
    const usuarioId = parseInt(session.user.id);

    const post = await prisma.coordinationPost.findUnique({
      where: { id_post: postId },
      include: { publicacion: true },
    });

    if (!post) {
      return { error: "El post no existe" };
    }

    if (post.autor_id !== usuarioId) {
      return { error: "No tienes permiso para editar este post" };
    }

    await prisma.coordinationPost.update({
      where: { id_post: postId },
      data: { titulo, contenido, tipo: tipo as any },
    });

    revalidatePath(`/producto/${post.publicacion_id}`);
    return { success: true };
  } catch (error) {
    console.error("Error al editar post:", error);
    return { error: "Error al editar post" };
  }
}

export async function eliminarComentarioCoordinacion(comentarioId: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "No autorizado" };

  try {
    const usuarioId = parseInt(session.user.id);

    const comentario = await prisma.coordinationComment.findUnique({
      where: { id_comentario: comentarioId },
      include: { post: { include: { publicacion: true } } },
    });

    if (!comentario) {
      return { error: "El comentario no existe" };
    }

    const esAutor = comentario.autor_id === usuarioId;
    const esAutorPost = comentario.post.autor_id === usuarioId;
    const esCreador = comentario.post.publicacion.creador_id === usuarioId;

    if (!esAutor && !esAutorPost && !esCreador) {
      return { error: "No tienes permiso para eliminar este comentario" };
    }

    const publicacionId = comentario.post.publicacion_id;

    await prisma.coordinationComment.delete({
      where: { id_comentario: comentarioId },
    });

    revalidatePath(`/producto/${publicacionId}`);
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar comentario:", error);
    return { error: "Error al eliminar comentario" };
  }
}

export async function editarComentarioCoordinacion(comentarioId: number, contenido: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "No autorizado" };

  if (!contenido || contenido.trim().length === 0) {
    return { error: "El contenido no puede estar vacío" };
  }

  try {
    const usuarioId = parseInt(session.user.id);

    const comentario = await prisma.coordinationComment.findUnique({
      where: { id_comentario: comentarioId },
      include: { post: { include: { publicacion: true } } },
    });

    if (!comentario) {
      return { error: "El comentario no existe" };
    }

    if (comentario.autor_id !== usuarioId) {
      return { error: "No tienes permiso para editar este comentario" };
    }

    const publicacionId = comentario.post.publicacion_id;

    await prisma.coordinationComment.update({
      where: { id_comentario: comentarioId },
      data: { contenido: contenido.trim() },
    });

    revalidatePath(`/producto/${publicacionId}`);
    return { success: true };
  } catch (error) {
    console.error("Error al editar comentario:", error);
    return { error: "Error al editar comentario" };
  }
}
