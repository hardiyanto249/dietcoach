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
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { profile: true }
        });

        if (!user?.profile) {
            return NextResponse.json({ isLooking: false, matches: [] });
        }

        if (!user.lookingForBuddy) {
            return NextResponse.json({ isLooking: false, matches: [] });
        }

        // Find potential matches
        const potentialMatches = await prisma.user.findMany({
            where: {
                id: { not: userId },
                lookingForBuddy: true,
                profile: {
                    isNot: null
                }
            },
            include: { profile: true },
            take: 10
        });

        const matches = potentialMatches.map(match => {
            let score = 0;
            // Simple matching logic
            if (match.profile?.goal === user.profile?.goal) score += 40;
            if (Math.abs((match.profile?.age || 0) - (user.profile?.age || 0)) < 5) score += 20;
            if (match.profile?.activityLevel === user.profile?.activityLevel) score += 20;
            if (match.profile?.gender === user.profile?.gender) score += 20;

            return {
                id: match.id,
                name: match.name,
                age: match.profile?.age,
                gender: match.profile?.gender,
                goal: match.profile?.goal,
                matchScore: score
            };
        }).sort((a, b) => b.matchScore - a.matchScore);

        return NextResponse.json({ isLooking: true, matches });
    } catch (error) {
        console.error("Error fetching matches:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
