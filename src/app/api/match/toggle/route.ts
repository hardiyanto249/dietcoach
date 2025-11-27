import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@/lib/session";

const prisma = new PrismaClient();

async function getUserId() {
    const session = await getSession();
    return session?.userId;
}

export async function POST() {
    try {
        const userId = await getUserId();
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        const newStatus = !user?.lookingForBuddy;

        await prisma.user.update({
            where: { id: userId },
            data: { lookingForBuddy: newStatus }
        });

        return NextResponse.json({ isLooking: newStatus });
    } catch (error) {
        console.error("Error toggling status:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
