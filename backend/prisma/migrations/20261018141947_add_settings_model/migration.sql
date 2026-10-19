/*
  Warnings:

  - Added the required column `nextDueDate` to the `Member` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "admissionPaid" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "hasCardio" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPaid" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "nextDueDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "planMonths" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "totalPaid" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Settings" (
    "id" SERIAL NOT NULL,
    "admissionFee" DOUBLE PRECISION NOT NULL DEFAULT 700,
    "monthlyFee" DOUBLE PRECISION NOT NULL DEFAULT 500,
    "cardioFee" DOUBLE PRECISION NOT NULL DEFAULT 200,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);
