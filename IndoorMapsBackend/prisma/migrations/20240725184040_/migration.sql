-- AlterTable
ALTER TABLE "Building" ADD COLUMN     "buildingGroupsId" INTEGER;

-- CreateTable
CREATE TABLE "BuildingGroup" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BuildingGroup_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Building" ADD CONSTRAINT "Building_buildingGroupsId_fkey" FOREIGN KEY ("buildingGroupsId") REFERENCES "BuildingGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
