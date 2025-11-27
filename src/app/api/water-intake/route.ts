import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    try {
        // Get all water logs for today
        const logs = await prisma.waterIntake.findMany({
            where: {
                userId: session.userId,
                loggedAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
        });

        // Calculate total glasses
        const totalGlasses = logs.reduce((acc, log) => acc + log.glasses, 0);

        return NextResponse.json({ totalGlasses, logs });
    } catch (error) {
        console.error("Failed to fetch water intake:", error);
        return NextResponse.json({ error: "Failed to fetch water intake" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { glasses } = body; // Can be positive (add) or negative (remove)

        // If removing, we need to find the latest log and remove it or create a negative log?
        // Better approach for history: Create a log with negative value or just delete the last log?
        // Let's stick to: Create a log. If glasses is negative, it represents undoing.
        // But schema says glasses is Int.

        // Alternative: If glasses is negative, find the most recent log and delete it?
        // Or just allow negative values in DB. Let's allow negative values for simplicity of "adjustment".
        // But logically, you can't drink -1 glass.
        // Let's implement: 
        // If +1: Create new log.
        // If -1: Delete the most recent log of today.

        if (glasses > 0) {
            console.log("Adding water intake:", { userId: session.userId, glasses });
            const log = await prisma.waterIntake.create({
                data: {
                    userId: session.userId,
                    glasses: glasses,
                    loggedAt: new Date(),
                },
            });
            console.log("Water intake created:", log.id);
            return NextResponse.json(log);
        } else if (glasses < 0) {
            // Find latest log today
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);

            const latestLog = await prisma.waterIntake.findFirst({
                where: {
                    userId: session.userId,
                    loggedAt: { gte: startOfDay, lte: endOfDay },
                },
                orderBy: { loggedAt: 'desc' }
            });

            if (latestLog) {
                await prisma.waterIntake.delete({
                    where: { id: latestLog.id }
                });
                return NextResponse.json({ message: "Removed last log" });
            } else {
                return NextResponse.json({ error: "No logs to remove" }, { status: 400 });
            }
        }

        return NextResponse.json({ error: "Invalid amount" }, { status: 400 });

    } catch (error) {
        console.error("Water log error:", error);
        return NextResponse.json({ error: "Failed to log water" }, { status: 500 });
    }
}
