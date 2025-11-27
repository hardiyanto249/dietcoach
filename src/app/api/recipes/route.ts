import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
        const recipes = await prisma.recipe.findMany({
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(recipes);
    } catch (error) {
        console.error("Error fetching recipes:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
