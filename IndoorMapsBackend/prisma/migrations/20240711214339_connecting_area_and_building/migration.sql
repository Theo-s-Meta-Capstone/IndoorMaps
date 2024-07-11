-- AlterTable
ALTER TABLE "Area" ADD COLUMN     "buildingId" INTEGER;

-- AddForeignKey
ALTER TABLE "Area" ADD CONSTRAINT "Area_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE SET NULL ON UPDATE CASCADE;
