-- AlterEnum
ALTER TYPE "EstadoPublicacion" ADD VALUE 'COMPLETADA';

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "publicacion_id" INTEGER;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_publicacion_id_fkey" FOREIGN KEY ("publicacion_id") REFERENCES "Publicacion"("id_publicacion") ON DELETE SET NULL ON UPDATE CASCADE;
