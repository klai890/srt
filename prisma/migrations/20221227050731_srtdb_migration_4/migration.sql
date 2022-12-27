/*
  Warnings:

  - The `athlete` column on the `Account` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "athlete",
ADD COLUMN     "athlete" JSONB;
