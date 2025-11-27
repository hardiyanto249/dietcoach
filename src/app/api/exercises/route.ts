import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { encrypt, decrypt } from "@/lib/crypto";

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
        const logs = await prisma.exercise.findMany({
            where: {
                userId: session.userId,
                loggedAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            orderBy: {
                loggedAt: "desc",
            },
        });



        // Decrypt notes
        const decryptedLogs = logs.map(log => ({
            ...log,
            notes: decrypt(log.notes || "")
        }));

        return NextResponse.json(decryptedLogs);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch exercise logs" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { exerciseName, duration, caloriesBurned, notes } = body;

        const log = await prisma.exercise.create({
            data: {
                userId: session.userId,
                exerciseName,
                duration: parseInt(duration),
                caloriesBurned: parseInt(caloriesBurned),
                notes: encrypt(notes || ""), // Encrypt notes
                loggedAt: new Date(),
            },
        });

        // Decrypt for response
        return NextResponse.json({
            ...log,
            notes: decrypt(log.notes || "")
        });
    } catch (error) {
        console.error("Create exercise log error:", error);
        return NextResponse.json({ error: "Failed to create exercise log" }, { status: 500 });
    }
}
