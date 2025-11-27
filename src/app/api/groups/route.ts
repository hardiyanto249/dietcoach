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

        const groups = await prisma.group.findMany({
            include: {
                _count: {
                    select: { members: true },
                },
                members: {
                    where: { userId: userId || "" },
                    select: { id: true },
                }
            },
            orderBy: { name: 'asc' }
        });

        const formattedGroups = groups.map(g => ({
            id: g.id,
            name: g.name,
            description: g.description,
            category: g.category,
            membersCount: g._count.members,
            isJoined: g.members.length > 0,
        }));

        return NextResponse.json(formattedGroups);
    } catch (error) {
        console.error("Error fetching groups:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
