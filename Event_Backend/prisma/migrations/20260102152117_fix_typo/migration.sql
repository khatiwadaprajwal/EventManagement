/*
  Warnings:

  - You are about to drop the column `mages` on the `events` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "events" DROP COLUMN "mages",
ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[];
