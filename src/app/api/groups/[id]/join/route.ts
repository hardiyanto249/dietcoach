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
        const existing = await prisma.userGroup.findUnique({
            where: {
                userId_groupId: {
                    userId,
                    groupId: id,
                },
            },
        });

        if (existing) {
            return NextResponse.json({ message: "Already joined" }, { status: 400 });
        }

        await prisma.userGroup.create({
            data: {
                userId,
                groupId: id,
                role: "MEMBER",
            },
        });

        return NextResponse.json({ message: "Joined successfully" });
    } catch (error) {
        console.error("Error joining group:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
