import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    try {
        const whereClause = query ? {
            name: {
                contains: query,
                mode: "insensitive" as const, // Fix type issue
            },
        } : {};

        const foods = await prisma.foodItem.findMany({
            where: whereClause,
            take: 1000, // Limit to 1000 items to ensure all foods are loaded
        });

        return NextResponse.json(foods);
    } catch (error) {
        console.error("Search food error:", error);
        return NextResponse.json({ error: "Failed to search foods" }, { status: 500 });
    }
}
