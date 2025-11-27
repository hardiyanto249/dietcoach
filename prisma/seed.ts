import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const foodItems = [
    // Existing items
    { name: "Nasi Goreng", calories: 550, portion: "1 piring", protein: 15, carbs: 65, fat: 20, category: "makanan berat" },
    { name: "Nasi Putih", calories: 350, portion: "1 piring", protein: 6, carbs: 75, fat: 1, category: "makanan berat" },
    { name: "Soto Ayam", calories: 450, portion: "1 mangkok", protein: 25, carbs: 40, fat: 15, category: "makanan berat" },
    { name: "Mie Goreng", calories: 480, portion: "1 piring", protein: 12, carbs: 60, fat: 18, category: "makanan berat" },
    { name: "Ayam Goreng", calories: 280, portion: "1 potong", protein: 22, carbs: 0, fat: 18, category: "lauk" },
    { name: "Rendang", calories: 420, portion: "1 porsi", protein: 30, carbs: 10, fat: 25, category: "lauk" },
    { name: "Gado-gado", calories: 380, portion: "1 porsi", protein: 18, carbs: 45, fat: 12, category: "makanan berat" },
    { name: "Sate Ayam", calories: 350, portion: "5 tusuk", protein: 25, carbs: 10, fat: 20, category: "lauk" },
    { name: "Bakso", calories: 320, portion: "1 mangkok", protein: 20, carbs: 30, fat: 15, category: "makanan berat" },
    { name: "Ketoprak", calories: 400, portion: "1 porsi", protein: 12, carbs: 50, fat: 15, category: "makanan berat" },
    { name: "Bubur Ayam", calories: 300, portion: "1 mangkok", protein: 10, carbs: 45, fat: 8, category: "makanan berat" },
    { name: "Nasi Uduk", calories: 450, portion: "1 porsi", protein: 8, carbs: 60, fat: 18, category: "makanan berat" },
    { name: "Telur Dadar", calories: 90, portion: "1 butir", protein: 7, carbs: 1, fat: 7, category: "lauk" },
    { name: "Telur Rebus", calories: 75, portion: "1 butir", protein: 7, carbs: 1, fat: 5, category: "lauk" },
    { name: "Tempe Goreng", calories: 80, portion: "1 potong", protein: 5, carbs: 6, fat: 4, category: "lauk" },
    { name: "Tahu Goreng", calories: 60, portion: "1 potong", protein: 4, carbs: 2, fat: 4, category: "lauk" },
    { name: "Pisang", calories: 90, portion: "1 buah", protein: 1, carbs: 23, fat: 0, category: "buah" },
    { name: "Apel", calories: 52, portion: "1 buah", protein: 0, carbs: 14, fat: 0, category: "buah" },
    { name: "Jeruk", calories: 62, portion: "1 buah", protein: 1, carbs: 15, fat: 0, category: "buah" },
    { name: "Teh Manis", calories: 150, portion: "1 gelas", protein: 0, carbs: 38, fat: 0, category: "minuman" },
    { name: "Kopi Hitam", calories: 5, portion: "1 gelas", protein: 0, carbs: 1, fat: 0, category: "minuman" },
    { name: "Kopi Susu", calories: 120, portion: "1 gelas", protein: 4, carbs: 15, fat: 5, category: "minuman" },
    { name: "Es Jeruk", calories: 140, portion: "1 gelas", protein: 1, carbs: 35, fat: 0, category: "minuman" },
    { name: "Roti Tawar", calories: 80, portion: "1 lembar", protein: 3, carbs: 15, fat: 1, category: "snack" },
    { name: "Martabak Manis", calories: 350, portion: "1 potong", protein: 5, carbs: 45, fat: 18, category: "snack" },
    { name: "Gorengan", calories: 140, portion: "1 buah", protein: 2, carbs: 18, fat: 8, category: "snack" },
    { name: "Bakwan", calories: 140, portion: "1 buah", protein: 2, carbs: 18, fat: 8, category: "snack" },

    // NEW: Sate Variations
    { name: "Sate Kambing", calories: 380, portion: "5 tusuk", protein: 28, carbs: 8, fat: 22, category: "lauk" },
    { name: "Sate Padang", calories: 400, portion: "5 tusuk", protein: 26, carbs: 12, fat: 24, category: "lauk" },
    { name: "Sate Lilit", calories: 320, portion: "5 tusuk", protein: 24, carbs: 10, fat: 18, category: "lauk" },
    { name: "Sate Maranggi", calories: 360, portion: "5 tusuk", protein: 27, carbs: 9, fat: 20, category: "lauk" },

    // NEW: Nasi Varieties
    { name: "Nasi Kuning", calories: 420, portion: "1 piring", protein: 8, carbs: 68, fat: 14, category: "makanan berat" },
    { name: "Nasi Liwet", calories: 480, portion: "1 piring", protein: 10, carbs: 70, fat: 16, category: "makanan berat" },
    { name: "Nasi Pecel", calories: 520, portion: "1 piring", protein: 14, carbs: 72, fat: 18, category: "makanan berat" },
    { name: "Nasi Campur", calories: 600, portion: "1 piring", protein: 20, carbs: 75, fat: 22, category: "makanan berat" },
    { name: "Nasi Kebuli", calories: 580, portion: "1 piring", protein: 18, carbs: 70, fat: 24, category: "makanan berat" },

    // NEW: Mie/Noodles
    { name: "Mie Ayam", calories: 420, portion: "1 mangkok", protein: 18, carbs: 55, fat: 14, category: "makanan berat" },
    { name: "Mie Rebus", calories: 380, portion: "1 mangkok", protein: 12, carbs: 52, fat: 12, category: "makanan berat" },
    { name: "Bakmi Jawa", calories: 450, portion: "1 piring", protein: 15, carbs: 58, fat: 16, category: "makanan berat" },
    { name: "Kwetiau Goreng", calories: 500, portion: "1 piring", protein: 14, carbs: 62, fat: 20, category: "makanan berat" },
    { name: "Bihun Goreng", calories: 440, portion: "1 piring", protein: 10, carbs: 60, fat: 16, category: "makanan berat" },
    { name: "Indomie Goreng", calories: 390, portion: "1 bungkus", protein: 9, carbs: 58, fat: 14, category: "makanan berat" },
    { name: "Indomie Kuah", calories: 350, portion: "1 mangkok", protein: 8, carbs: 54, fat: 12, category: "makanan berat" },

    // NEW: Soup/Soto
    { name: "Soto Betawi", calories: 480, portion: "1 mangkok", protein: 22, carbs: 35, fat: 20, category: "makanan berat" },
    { name: "Soto Lamongan", calories: 420, portion: "1 mangkok", protein: 24, carbs: 38, fat: 16, category: "makanan berat" },
    { name: "Rawon", calories: 460, portion: "1 mangkok", protein: 26, carbs: 40, fat: 18, category: "makanan berat" },
    { name: "Sup Ayam", calories: 280, portion: "1 mangkok", protein: 18, carbs: 25, fat: 10, category: "makanan berat" },
    { name: "Sup Iga", calories: 380, portion: "1 mangkok", protein: 24, carbs: 28, fat: 16, category: "makanan berat" },
    { name: "Tongseng", calories: 420, portion: "1 mangkok", protein: 22, carbs: 32, fat: 18, category: "makanan berat" },
    { name: "Gulai Kambing", calories: 450, portion: "1 mangkok", protein: 25, carbs: 30, fat: 22, category: "makanan berat" },

    // NEW: Lauk Pauk
    { name: "Ayam Bakar", calories: 260, portion: "1 potong", protein: 24, carbs: 2, fat: 16, category: "lauk" },
    { name: "Ayam Geprek", calories: 320, portion: "1 porsi", protein: 26, carbs: 8, fat: 20, category: "lauk" },
    { name: "Ikan Goreng", calories: 220, portion: "1 ekor", protein: 20, carbs: 0, fat: 14, category: "lauk" },
    { name: "Ikan Bakar", calories: 200, portion: "1 ekor", protein: 22, carbs: 0, fat: 12, category: "lauk" },
    { name: "Pepes Ikan", calories: 180, portion: "1 bungkus", protein: 18, carbs: 4, fat: 10, category: "lauk" },
    { name: "Dendeng Balado", calories: 280, portion: "1 porsi", protein: 22, carbs: 8, fat: 18, category: "lauk" },
    { name: "Sambal Goreng Ati", calories: 240, portion: "1 porsi", protein: 16, carbs: 12, fat: 14, category: "lauk" },
    { name: "Perkedel", calories: 120, portion: "1 buah", protein: 4, carbs: 14, fat: 6, category: "lauk" },
    { name: "Otak-otak", calories: 150, portion: "1 buah", protein: 12, carbs: 8, fat: 8, category: "lauk" },
    { name: "Pempek", calories: 180, portion: "1 buah", protein: 10, carbs: 20, fat: 6, category: "lauk" },
    { name: "Siomay", calories: 220, portion: "1 porsi", protein: 14, carbs: 24, fat: 8, category: "lauk" },
    { name: "Batagor", calories: 240, portion: "1 porsi", protein: 12, carbs: 26, fat: 10, category: "lauk" },
    { name: "Lumpia", calories: 160, portion: "1 buah", protein: 6, carbs: 18, fat: 8, category: "snack" },

    // NEW: Sayur
    { name: "Sayur Asem", calories: 120, portion: "1 mangkok", protein: 4, carbs: 18, fat: 4, category: "sayur" },
    { name: "Sayur Lodeh", calories: 180, portion: "1 mangkok", protein: 6, carbs: 20, fat: 8, category: "sayur" },
    { name: "Capcay", calories: 160, portion: "1 porsi", protein: 8, carbs: 22, fat: 6, category: "sayur" },
    { name: "Tumis Kangkung", calories: 100, portion: "1 porsi", protein: 4, carbs: 12, fat: 4, category: "sayur" },
    { name: "Tumis Buncis", calories: 90, portion: "1 porsi", protein: 3, carbs: 10, fat: 4, category: "sayur" },
    { name: "Urap", calories: 140, portion: "1 porsi", protein: 6, carbs: 16, fat: 6, category: "sayur" },
    { name: "Pecel", calories: 200, portion: "1 porsi", protein: 8, carbs: 24, fat: 8, category: "sayur" },

    // NEW: Snacks
    { name: "Martabak Telur", calories: 380, portion: "1 potong", protein: 12, carbs: 35, fat: 22, category: "snack" },
    { name: "Pisang Goreng", calories: 150, portion: "1 buah", protein: 2, carbs: 28, fat: 4, category: "snack" },
    { name: "Risoles", calories: 180, portion: "1 buah", protein: 6, carbs: 20, fat: 8, category: "snack" },
    { name: "Pastel", calories: 160, portion: "1 buah", protein: 5, carbs: 18, fat: 8, category: "snack" },
    { name: "Lemper", calories: 140, portion: "1 buah", protein: 6, carbs: 22, fat: 4, category: "snack" },
    { name: "Onde-onde", calories: 120, portion: "1 buah", protein: 2, carbs: 20, fat: 4, category: "snack" },
    { name: "Klepon", calories: 100, portion: "1 buah", protein: 1, carbs: 18, fat: 3, category: "snack" },
    { name: "Kue Lapis", calories: 130, portion: "1 potong", protein: 2, carbs: 24, fat: 4, category: "snack" },
    { name: "Donat", calories: 250, portion: "1 buah", protein: 4, carbs: 32, fat: 12, category: "snack" },
    { name: "Roti Bakar", calories: 180, portion: "1 porsi", protein: 5, carbs: 26, fat: 6, category: "snack" },

    // NEW: Minuman
    { name: "Es Teh", calories: 140, portion: "1 gelas", protein: 0, carbs: 36, fat: 0, category: "minuman" },
    { name: "Es Campur", calories: 280, portion: "1 mangkok", protein: 4, carbs: 58, fat: 4, category: "minuman" },
    { name: "Es Cendol", calories: 220, portion: "1 gelas", protein: 2, carbs: 48, fat: 4, category: "minuman" },
    { name: "Jus Alpukat", calories: 240, portion: "1 gelas", protein: 3, carbs: 32, fat: 12, category: "minuman" },
    { name: "Jus Mangga", calories: 160, portion: "1 gelas", protein: 1, carbs: 38, fat: 0, category: "minuman" },
    { name: "Jus Jambu", calories: 120, portion: "1 gelas", protein: 1, carbs: 28, fat: 0, category: "minuman" },

    // Additional popular items
    { name: "Nasi Padang", calories: 650, portion: "1 porsi", protein: 25, carbs: 80, fat: 26, category: "makanan berat" },
    { name: "Ayam Penyet", calories: 480, portion: "1 porsi", protein: 28, carbs: 35, fat: 24, category: "makanan berat" },
    { name: "Pecel Lele", calories: 420, portion: "1 porsi", protein: 24, carbs: 40, fat: 18, category: "makanan berat" },
];

async function main() {
    console.log('Start seeding...');
    for (const food of foodItems) {
        const existing = await prisma.foodItem.findUnique({
            where: { name: food.name }
        });

        if (!existing) {
            await prisma.foodItem.create({
                data: food,
            });
            console.log(`Created food item: ${food.name}`);
        } else {
            console.log(`Skipped existing: ${food.name}`);
        }
    }
    console.log(`Seeding finished. Total items: ${foodItems.length}`);

    // Seed Challenges
    const challenges = [
        {
            title: "7-Day No Sugar Challenge",
            description: "Avoid added sugar for a week to reset your taste buds.",
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            targetType: "NO_SUGAR",
            targetValue: 7
        },
        {
            title: "10k Steps Daily",
            description: "Walk 10,000 steps every day for better heart health.",
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            targetType: "STEPS",
            targetValue: 10000
        },
        {
            title: "Hydration Hero",
            description: "Drink 8 glasses of water daily.",
            startDate: new Date(),
            endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            targetType: "WATER",
            targetValue: 8
        }
    ];

    for (const c of challenges) {
        const existing = await prisma.challenge.findFirst({ where: { title: c.title } });
        if (!existing) {
            await prisma.challenge.create({ data: c });
            console.log(`Created challenge: ${c.title}`);
        }
    }

    // Seed Groups
    const groups = [
        { name: "Jakarta Healthy Living", description: "Community for healthy lifestyle enthusiasts in Jakarta.", category: "CITY" },
        { name: "Surabaya Diet Club", description: "Support group for dieters in Surabaya.", category: "CITY" },
        { name: "New Moms Diet", description: "Post-pregnancy weight loss support.", category: "AGE" },
        { name: "Keto Warriors", description: "For those following the Ketogenic diet.", category: "GOAL" },
        { name: "Intermittent Fasting Indo", description: "Sharing IF schedules and tips.", category: "GOAL" }
    ];

    for (const g of groups) {
        const existing = await prisma.group.findFirst({ where: { name: g.name } });
        if (!existing) {
            await prisma.group.create({ data: g });
            console.log(`Created group: ${g.name}`);
        }
    }

    // Seed Recipes
    const recipes = [
        {
            title: "Pepes Tahu Jamur",
            description: "Steamed tofu and mushrooms in banana leaf. Low calorie and high protein.",
            calories: 120,
            protein: 8,
            carbs: 6,
            fat: 5,
            prepTime: 15,
            cookTime: 20,
            servings: 2,
            category: "LUNCH",
            instructions: "1. Mash tofu. 2. Mix with spices and mushrooms. 3. Wrap in banana leaf. 4. Steam for 20 mins.",
            imageUrl: "https://images.unsplash.com/photo-1626804475297-411dbe274229?q=80&w=800&auto=format&fit=crop"
        },
        {
            title: "Soto Ayam Tanpa Santan",
            description: "Clear chicken soup with turmeric and herbs. Refreshing and light.",
            calories: 250,
            protein: 20,
            carbs: 15,
            fat: 8,
            prepTime: 20,
            cookTime: 45,
            servings: 4,
            category: "DINNER",
            instructions: "1. Boil chicken. 2. Sauté spices. 3. Add to broth. 4. Serve with cabbage and bean sprouts.",
            imageUrl: "https://images.unsplash.com/photo-1603082303289-7768839d8868?q=80&w=800&auto=format&fit=crop"
        },
        {
            title: "Tumis Kangkung Terasi",
            description: "Stir-fried water spinach with shrimp paste. Quick and tasty.",
            calories: 90,
            protein: 3,
            carbs: 8,
            fat: 5,
            prepTime: 10,
            cookTime: 5,
            servings: 2,
            category: "LUNCH",
            instructions: "1. Chop garlic and chili. 2. Sauté with shrimp paste. 3. Add kangkung. 4. Stir fry quickly.",
            imageUrl: "https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?q=80&w=800&auto=format&fit=crop"
        }
    ];

    for (const r of recipes) {
        const existing = await prisma.recipe.findFirst({ where: { title: r.title } });
        if (!existing) {
            await prisma.recipe.create({ data: r });
            console.log(`Created recipe: ${r.title}`);
        }
    }

}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
