import { PrismaClient } from ".prisma/client";

interface Context{
    prisma : PrismaClient,
    userId? : number
}
