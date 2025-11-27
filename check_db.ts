
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const count = await prisma.foodItem.count();
    console.log(`Total food items: ${count}`);

    const foods = await prisma.foodItem.findMany({
        take: 100,
    });

    console.log("First 10 items:");
    foods.slice(0, 10).forEach(f => console.log(`- ${f.name}`));

    const ayam = await prisma.foodItem.findFirst({
        where: {
            name: {
                equals: "Ayam Goreng",
                mode: "insensitive"
            }
        }
    });

    if (ayam) {
        console.log("FOUND: Ayam Goreng is in the database.");
    } else {
        console.log("ERROR: Ayam Goreng is NOT in the database.");
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
