
import { PrismaClient } from '@prisma/client';
import { checkMessageLimit } from './src/lib/subscription';

const prisma = new PrismaClient();

async function main() {
    console.log("1. Testing Prisma Connection...");
    try {
        const userCount = await prisma.user.count();
        console.log(`   Success! Found ${userCount} users.`);
    } catch (e) {
        console.error("   Failed to connect to DB:", e);
        return;
    }

    console.log("2. Testing checkMessageLimit...");
    try {
        // Get first user
        const user = await prisma.user.findFirst();
        if (user) {
            console.log(`   Testing for user: ${user.email} (${user.id})`);
            const result = await checkMessageLimit(user.id);
            console.log("   Result:", result);
        } else {
            console.log("   No users found to test.");
        }
    } catch (e) {
        console.error("   Failed checkMessageLimit:", e);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
