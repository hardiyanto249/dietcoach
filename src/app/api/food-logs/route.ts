import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { encrypt, decrypt } from "@/lib/crypto";

export async function GET(request: NextRequest) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date"); // YYYY-MM-DD

    let dateFilter = {};
    if (dateParam) {
        const startOfDay = new Date(dateParam);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(dateParam);
        endOfDay.setHours(23, 59, 59, 999);

        dateFilter = {
            loggedAt: {
                gte: startOfDay,
                lte: endOfDay,
            },
        };
    } else {
        // Default to today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        dateFilter = {
            loggedAt: {
                gte: startOfDay,
                lte: endOfDay,
            },
        };
    }

    try {
        const logs = await prisma.foodLog.findMany({
            where: {
                userId: session.userId,
                ...dateFilter,
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
        return NextResponse.json({ error: "Failed to fetch food logs" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { foodName, portion, calories, protein, carbs, fat, mealType, imageUrl, notes } = body;

        // Basic validation for required fields
        if (!foodName || calories === undefined || calories === null) {
            return NextResponse.json({ error: "Food name and calories are required" }, { status: 400 });
        }

        console.log("Creating food log with data:", { foodName, portion, calories, protein, carbs, fat, mealType });

        const log = await prisma.foodLog.create({
            data: {
                userId: session.userId,
                foodName,
                portion: portion || "1 serving",
                calories,
                protein: protein || 0,
                carbs: carbs || 0,
                fat: fat || 0,
                mealType: mealType || "snack",
                imageUrl: imageUrl || null,
                notes: notes ? encrypt(notes) : null,
                loggedAt: new Date(),
            },
        });

        console.log("Food log created successfully:", log.id);

        return NextResponse.json({
            ...log,
            notes: notes || ""
        });
    } catch (error: any) {
        console.error("Create food log error:", error);
        return NextResponse.json({
            error: "Failed to create food log",
            details: error.message
        }, { status: 500 });
    }
}
