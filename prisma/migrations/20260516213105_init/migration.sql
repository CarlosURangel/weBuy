-- CreateTable
CREATE TABLE `Usuario` (
    `id_usuario` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `correo` VARCHAR(100) NOT NULL,
    `contrasena` VARCHAR(255) NOT NULL,
    `telefono` VARCHAR(20) NOT NULL,
    `localidad` VARCHAR(100) NOT NULL,
    `rol` ENUM('COMPRADOR', 'ADMINISTRADOR') NOT NULL DEFAULT 'COMPRADOR',
    `penalizado_hasta` DATETIME(3) NULL,

    UNIQUE INDEX `Usuario_correo_key`(`correo`),
    PRIMARY KEY (`id_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Publicacion` (
    `id_publicacion` INTEGER NOT NULL AUTO_INCREMENT,
    `creador_id` INTEGER NOT NULL,
    `titulo` VARCHAR(150) NOT NULL,
    `descripcion` TEXT NOT NULL,
    `url_origen` TEXT NOT NULL,
    `imagen_url` TEXT NULL,
    `precio_unitario` DECIMAL(10, 2) NOT NULL,
    `precio_mayoreo` DECIMAL(10, 2) NOT NULL,
    `meta_unidades` INTEGER NOT NULL,
    `fecha_limite` DATETIME(3) NOT NULL,
    `estado` ENUM('ACTIVA', 'META_ALCANZADA', 'CANCELADA') NOT NULL DEFAULT 'ACTIVA',

    PRIMARY KEY (`id_publicacion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Participacion` (
    `id_participacion` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` INTEGER NOT NULL,
    `publicacion_id` INTEGER NOT NULL,
    `cantidad` INTEGER NOT NULL,

    PRIMARY KEY (`id_participacion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Mensaje` (
    `id_mensaje` INTEGER NOT NULL AUTO_INCREMENT,
    `publicacion_id` INTEGER NOT NULL,
    `usuario_id` INTEGER NOT NULL,
    `contenido` TEXT NOT NULL,
    `fecha_envio` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_mensaje`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Publicacion` ADD CONSTRAINT `Publicacion_creador_id_fkey` FOREIGN KEY (`creador_id`) REFERENCES `Usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Participacion` ADD CONSTRAINT `Participacion_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `Usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Participacion` ADD CONSTRAINT `Participacion_publicacion_id_fkey` FOREIGN KEY (`publicacion_id`) REFERENCES `Publicacion`(`id_publicacion`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Mensaje` ADD CONSTRAINT `Mensaje_publicacion_id_fkey` FOREIGN KEY (`publicacion_id`) REFERENCES `Publicacion`(`id_publicacion`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Mensaje` ADD CONSTRAINT `Mensaje_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `Usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;
