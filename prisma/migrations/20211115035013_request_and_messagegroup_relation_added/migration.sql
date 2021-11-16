/*
  Warnings:

  - A unique constraint covering the columns `[messageGroupId]` on the table `Request` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `messageGroupId` to the `Request` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "messageGroupId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Request_messageGroupId_key" ON "Request"("messageGroupId");

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_messageGroupId_fkey" FOREIGN KEY ("messageGroupId") REFERENCES "MessageGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
