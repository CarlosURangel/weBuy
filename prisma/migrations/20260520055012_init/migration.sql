-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('COMPRADOR', 'ADMINISTRADOR');

-- CreateEnum
CREATE TYPE "EstadoPublicacion" AS ENUM ('ACTIVA', 'META_ALCANZADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "EstadoParticipacion" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TipoPost" AS ENUM ('GENERAL', 'UBICACION', 'PAGO', 'ACUERDO', 'ANUNCIO');

-- CreateEnum
CREATE TYPE "EstadoReporte" AS ENUM ('PENDIENTE', 'REVISADO', 'RESUELTO');

-- CreateTable
CREATE TABLE "Usuario" (
    "id_usuario" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "correo" VARCHAR(100) NOT NULL,
    "contrasena" VARCHAR(255) NOT NULL,
    "telefono" VARCHAR(20) NOT NULL,
    "localidad" VARCHAR(100) NOT NULL,
    "rol" "RolUsuario" NOT NULL DEFAULT 'COMPRADOR',
    "penalizado_hasta" TIMESTAMP(3),
    "calificacion_promedio" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "compras_completadas" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "Publicacion" (
    "id_publicacion" SERIAL NOT NULL,
    "creador_id" INTEGER NOT NULL,
    "titulo" VARCHAR(150) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "url_origen" TEXT NOT NULL,
    "imagen_url" TEXT,
    "precio_unitario" DECIMAL(10,2) NOT NULL,
    "precio_mayoreo" DECIMAL(10,2) NOT NULL,
    "meta_unidades" INTEGER NOT NULL,
    "fecha_limite" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoPublicacion" NOT NULL DEFAULT 'ACTIVA',

    CONSTRAINT "Publicacion_pkey" PRIMARY KEY ("id_publicacion")
);

-- CreateTable
CREATE TABLE "Participacion" (
    "id_participacion" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "publicacion_id" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "estado" "EstadoParticipacion" NOT NULL DEFAULT 'PENDING',
    "fecha_solicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_aprobacion" TIMESTAMP(3),

    CONSTRAINT "Participacion_pkey" PRIMARY KEY ("id_participacion")
);

-- CreateTable
CREATE TABLE "Mensaje" (
    "id_mensaje" SERIAL NOT NULL,
    "publicacion_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "contenido" TEXT NOT NULL,
    "fecha_envio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mensaje_pkey" PRIMARY KEY ("id_mensaje")
);

-- CreateTable
CREATE TABLE "CoordinationPost" (
    "id_post" SERIAL NOT NULL,
    "publicacion_id" INTEGER NOT NULL,
    "autor_id" INTEGER NOT NULL,
    "titulo" VARCHAR(200) NOT NULL,
    "contenido" TEXT NOT NULL,
    "tipo" "TipoPost" NOT NULL DEFAULT 'GENERAL',
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoordinationPost_pkey" PRIMARY KEY ("id_post")
);

-- CreateTable
CREATE TABLE "CoordinationComment" (
    "id_comentario" SERIAL NOT NULL,
    "post_id" INTEGER NOT NULL,
    "autor_id" INTEGER NOT NULL,
    "participacion_id" INTEGER,
    "contenido" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoordinationComment_pkey" PRIMARY KEY ("id_comentario")
);

-- CreateTable
CREATE TABLE "Review" (
    "id_resena" SERIAL NOT NULL,
    "resena_de_id" INTEGER NOT NULL,
    "resena_a_id" INTEGER NOT NULL,
    "calificacion" INTEGER NOT NULL DEFAULT 5,
    "comentario" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id_resena")
);

-- CreateTable
CREATE TABLE "Report" (
    "id_reporte" SERIAL NOT NULL,
    "reportero_id" INTEGER NOT NULL,
    "reportado_id" INTEGER NOT NULL,
    "razon" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "estado" "EstadoReporte" NOT NULL DEFAULT 'PENDIENTE',
    "fecha_reporte" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id_reporte")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");

-- AddForeignKey
ALTER TABLE "Publicacion" ADD CONSTRAINT "Publicacion_creador_id_fkey" FOREIGN KEY ("creador_id") REFERENCES "Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participacion" ADD CONSTRAINT "Participacion_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participacion" ADD CONSTRAINT "Participacion_publicacion_id_fkey" FOREIGN KEY ("publicacion_id") REFERENCES "Publicacion"("id_publicacion") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensaje" ADD CONSTRAINT "Mensaje_publicacion_id_fkey" FOREIGN KEY ("publicacion_id") REFERENCES "Publicacion"("id_publicacion") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensaje" ADD CONSTRAINT "Mensaje_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoordinationPost" ADD CONSTRAINT "CoordinationPost_publicacion_id_fkey" FOREIGN KEY ("publicacion_id") REFERENCES "Publicacion"("id_publicacion") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoordinationPost" ADD CONSTRAINT "CoordinationPost_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "Usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoordinationComment" ADD CONSTRAINT "CoordinationComment_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "CoordinationPost"("id_post") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoordinationComment" ADD CONSTRAINT "CoordinationComment_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "Usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoordinationComment" ADD CONSTRAINT "CoordinationComment_participacion_id_fkey" FOREIGN KEY ("participacion_id") REFERENCES "Participacion"("id_participacion") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_resena_de_id_fkey" FOREIGN KEY ("resena_de_id") REFERENCES "Usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_resena_a_id_fkey" FOREIGN KEY ("resena_a_id") REFERENCES "Usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reportero_id_fkey" FOREIGN KEY ("reportero_id") REFERENCES "Usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reportado_id_fkey" FOREIGN KEY ("reportado_id") REFERENCES "Usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;
