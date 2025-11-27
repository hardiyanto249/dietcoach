import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        include: {
            _count: {
                select: { foodLogs: true }
            }
        }
    });

    console.log(`Total users: ${users.length}`);

    for (const u of users) {
        console.log(`\nUser: ${u.email} (${u.id})`);
        console.log(`Total food logs: ${u._count.foodLogs}`);

        const logs = await prisma.foodLog.findMany({
            where: { userId: u.id },
            orderBy: { loggedAt: 'desc' },
            take: 10
        });

        if (logs.length > 0) {
            console.log('Recent logs:');
            logs.forEach(l => {
                console.log(`  - ${l.foodName} (${l.calories} kcal) [${l.mealType}] - ${l.loggedAt.toISOString()}`);
            });
        }
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
