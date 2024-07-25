/*
  Warnings:

  - You are about to drop the column `buildingGroupsId` on the `Building` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Building" DROP CONSTRAINT "Building_buildingGroupsId_fkey";

-- AlterTable
ALTER TABLE "Building" DROP COLUMN "buildingGroupsId";

-- CreateTable
CREATE TABLE "_BuildingToBuildingGroup" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_BuildingToBuildingGroup_AB_unique" ON "_BuildingToBuildingGroup"("A", "B");

-- CreateIndex
CREATE INDEX "_BuildingToBuildingGroup_B_index" ON "_BuildingToBuildingGroup"("B");

-- AddForeignKey
ALTER TABLE "_BuildingToBuildingGroup" ADD CONSTRAINT "_BuildingToBuildingGroup_A_fkey" FOREIGN KEY ("A") REFERENCES "Building"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BuildingToBuildingGroup" ADD CONSTRAINT "_BuildingToBuildingGroup_B_fkey" FOREIGN KEY ("B") REFERENCES "BuildingGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
