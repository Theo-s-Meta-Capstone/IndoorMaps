/*
  Warnings:

  - Added the required column `userId` to the `BuildingGroup` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BuildingGroup" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "BuildingGroup" ADD CONSTRAINT "BuildingGroup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
