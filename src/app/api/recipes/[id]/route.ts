import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const recipe = await prisma.recipe.findUnique({
            where: { id }
        });

        if (!recipe) {
            return NextResponse.json({ message: "Recipe not found" }, { status: 404 });
        }

        return NextResponse.json(recipe);
    } catch (error) {
        console.error("Error fetching recipe:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
