// 1
const { PrismaClient } = require("@prisma/client");



// 2
const prisma = new PrismaClient();

// 3
async function main() {
    console.log(
        await prisma.user.findUnique({
            where : {
                id : 1
            }
        }).friends()
    )
    prisma.user.deleteMany()

}



// 4
main()
    .catch((e) => {
        throw e;
    })
    // 5
    .finally(async () => {
        await prisma.$disconnect();
    });
