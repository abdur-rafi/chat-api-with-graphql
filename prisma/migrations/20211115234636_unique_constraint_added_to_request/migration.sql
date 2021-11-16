/*
  Warnings:

  - A unique constraint covering the columns `[fromId,toId]` on the table `Request` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Request_fromId_toId_key" ON "Request"("fromId", "toId");
