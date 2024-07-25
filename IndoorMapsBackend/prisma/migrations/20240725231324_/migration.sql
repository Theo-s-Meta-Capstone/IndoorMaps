/*
  Warnings:

  - You are about to drop the `_BuildingToBuildingGroup` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_BuildingToBuildingGroup" DROP CONSTRAINT "_BuildingToBuildingGroup_A_fkey";

-- DropForeignKey
ALTER TABLE "_BuildingToBuildingGroup" DROP CONSTRAINT "_BuildingToBuildingGroup_B_fkey";

-- AlterTable
ALTER TABLE "Building" ADD COLUMN     "buildingGroupId" INTEGER;

-- DropTable
DROP TABLE "_BuildingToBuildingGroup";

-- AddForeignKey
ALTER TABLE "Building" ADD CONSTRAINT "Building_buildingGroupId_fkey" FOREIGN KEY ("buildingGroupId") REFERENCES "BuildingGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
