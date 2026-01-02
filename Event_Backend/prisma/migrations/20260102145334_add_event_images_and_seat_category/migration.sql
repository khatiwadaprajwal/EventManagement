-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'ORGANIZER';

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "mages" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "seats" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'GENERAL';
