/*
  Warnings:

  - A unique constraint covering the columns `[userId,groupId]` on the table `groupMember` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "groupMember_userId_groupId_key" ON "groupMember"("userId", "groupId");
