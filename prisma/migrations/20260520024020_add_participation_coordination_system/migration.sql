/*
  Warnings:

  - A unique constraint covering the columns `[usuario_id,publicacion_id]` on the table `Participacion` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `mensaje` DROP FOREIGN KEY `Mensaje_publicacion_id_fkey`;

-- DropForeignKey
ALTER TABLE `mensaje` DROP FOREIGN KEY `Mensaje_usuario_id_fkey`;

-- DropForeignKey
ALTER TABLE `participacion` DROP FOREIGN KEY `Participacion_publicacion_id_fkey`;

-- DropForeignKey
ALTER TABLE `participacion` DROP FOREIGN KEY `Participacion_usuario_id_fkey`;

-- DropIndex
DROP INDEX `Mensaje_publicacion_id_fkey` ON `mensaje`;

-- DropIndex
DROP INDEX `Mensaje_usuario_id_fkey` ON `mensaje`;

-- DropIndex
DROP INDEX `Participacion_publicacion_id_fkey` ON `participacion`;

-- DropIndex
DROP INDEX `Participacion_usuario_id_fkey` ON `participacion`;

-- AlterTable
ALTER TABLE `participacion` ADD COLUMN `estado` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    ADD COLUMN `fecha_aprobacion` DATETIME(3) NULL,
    ADD COLUMN `fecha_solicitud` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `usuario` ADD COLUMN `calificacion_promedio` DECIMAL(3, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `compras_completadas` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `CoordinationPost` (
    `id_post` INTEGER NOT NULL AUTO_INCREMENT,
    `publicacion_id` INTEGER NOT NULL,
    `autor_id` INTEGER NOT NULL,
    `titulo` VARCHAR(200) NOT NULL,
    `contenido` TEXT NOT NULL,
    `tipo` ENUM('GENERAL', 'UBICACION', 'PAGO', 'ACUERDO', 'ANUNCIO') NOT NULL DEFAULT 'GENERAL',
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_post`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CoordinationComment` (
    `id_comentario` INTEGER NOT NULL AUTO_INCREMENT,
    `post_id` INTEGER NOT NULL,
    `autor_id` INTEGER NOT NULL,
    `participacion_id` INTEGER NULL,
    `contenido` TEXT NOT NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_comentario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Review` (
    `id_resena` INTEGER NOT NULL AUTO_INCREMENT,
    `resena_de_id` INTEGER NOT NULL,
    `resena_a_id` INTEGER NOT NULL,
    `calificacion` TINYINT NOT NULL,
    `comentario` TEXT NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_resena`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Report` (
    `id_reporte` INTEGER NOT NULL AUTO_INCREMENT,
    `reportero_id` INTEGER NOT NULL,
    `reportado_id` INTEGER NOT NULL,
    `razon` VARCHAR(100) NOT NULL,
    `descripcion` TEXT NULL,
    `estado` ENUM('PENDIENTE', 'REVISADO', 'RESUELTO') NOT NULL DEFAULT 'PENDIENTE',
    `fecha_reporte` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_reporte`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Participacion_usuario_id_publicacion_id_key` ON `Participacion`(`usuario_id`, `publicacion_id`);

-- AddForeignKey
ALTER TABLE `Participacion` ADD CONSTRAINT `Participacion_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `Usuario`(`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Participacion` ADD CONSTRAINT `Participacion_publicacion_id_fkey` FOREIGN KEY (`publicacion_id`) REFERENCES `Publicacion`(`id_publicacion`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Mensaje` ADD CONSTRAINT `Mensaje_publicacion_id_fkey` FOREIGN KEY (`publicacion_id`) REFERENCES `Publicacion`(`id_publicacion`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Mensaje` ADD CONSTRAINT `Mensaje_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `Usuario`(`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CoordinationPost` ADD CONSTRAINT `CoordinationPost_publicacion_id_fkey` FOREIGN KEY (`publicacion_id`) REFERENCES `Publicacion`(`id_publicacion`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CoordinationPost` ADD CONSTRAINT `CoordinationPost_autor_id_fkey` FOREIGN KEY (`autor_id`) REFERENCES `Usuario`(`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CoordinationComment` ADD CONSTRAINT `CoordinationComment_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `CoordinationPost`(`id_post`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CoordinationComment` ADD CONSTRAINT `CoordinationComment_autor_id_fkey` FOREIGN KEY (`autor_id`) REFERENCES `Usuario`(`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CoordinationComment` ADD CONSTRAINT `CoordinationComment_participacion_id_fkey` FOREIGN KEY (`participacion_id`) REFERENCES `Participacion`(`id_participacion`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_resena_de_id_fkey` FOREIGN KEY (`resena_de_id`) REFERENCES `Usuario`(`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_resena_a_id_fkey` FOREIGN KEY (`resena_a_id`) REFERENCES `Usuario`(`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_reportero_id_fkey` FOREIGN KEY (`reportero_id`) REFERENCES `Usuario`(`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_reportado_id_fkey` FOREIGN KEY (`reportado_id`) REFERENCES `Usuario`(`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;
