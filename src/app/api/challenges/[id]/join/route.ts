import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@/lib/session";

const prisma = new PrismaClient();

async function getUserId() {
    const session = await getSession();
    return session?.userId;
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const userId = await getUserId();
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Check if already joined
        const existing = await prisma.userChallenge.findUnique({
            where: {
                userId_challengeId: {
                    userId,
                    challengeId: id,
                },
            },
        });

        if (existing) {
            return NextResponse.json({ message: "Already joined" }, { status: 400 });
        }

        await prisma.userChallenge.create({
            data: {
                userId,
                challengeId: id,
                status: "JOINED",
            },
        });

        return NextResponse.json({ message: "Joined successfully" });
    } catch (error) {
        console.error("Error joining challenge:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
