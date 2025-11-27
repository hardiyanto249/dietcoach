import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@/lib/session";

const prisma = new PrismaClient();

async function getUserId() {
    const session = await getSession();
    return session?.userId;
}

export async function GET() {
    try {
        const userId = await getUserId();

        const challenges = await prisma.challenge.findMany({
            where: {
                endDate: {
                    gte: new Date(),
                },
            },
            include: {
                _count: {
                    select: { participants: true },
                },
                participants: {
                    where: { userId: userId || "" },
                    select: { id: true },
                }
            },
            orderBy: { startDate: 'desc' }
        });

        const formattedChallenges = challenges.map(c => ({
            id: c.id,
            title: c.title,
            description: c.description,
            startDate: c.startDate,
            endDate: c.endDate,
            targetType: c.targetType,
            targetValue: c.targetValue,
            participantsCount: c._count.participants,
            isJoined: c.participants.length > 0,
        }));

        return NextResponse.json(formattedChallenges);
    } catch (error) {
        console.error("Error fetching challenges:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
