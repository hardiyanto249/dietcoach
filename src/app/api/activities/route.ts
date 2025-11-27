import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { encrypt, decrypt } from "@/lib/crypto";

// GET /api/activities - Get all activities for current user
export async function GET(request: NextRequest) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        let whereClause: any = {
            userId: session.userId,
        };

        // Filter by date range if provided
        if (startDate && endDate) {
            whereClause.startTime = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }

        const activities = await prisma.dailyActivity.findMany({
            where: whereClause,
            orderBy: { startTime: "desc" },
        });

        const decryptedActivities = activities.map(activity => ({
            ...activity,
            description: decrypt(activity.description || "")
        }));

        return NextResponse.json(decryptedActivities);
    } catch (error) {
        console.error("Failed to fetch activities:", error);
        return NextResponse.json(
            { error: "Failed to fetch activities" },
            { status: 500 }
        );
    }
}

import { createCalendarEvent } from "@/lib/google-calendar";

// ... (GET function remains same)

// POST /api/activities - Create new activity
export async function POST(request: NextRequest) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { title, description, category, startTime, endTime, duration } = body;

        if (!title || !category || !startTime) {
            return NextResponse.json(
                { error: "Title, category, and startTime are required" },
                { status: 400 }
            );
        }

        // Calculate duration if endTime is provided and duration is not
        let calculatedDuration = duration;
        if (!calculatedDuration && endTime) {
            const start = new Date(startTime);
            const end = new Date(endTime);
            calculatedDuration = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
        }

        const activity = await prisma.dailyActivity.create({
            data: {
                userId: session.userId,
                title,
                description: encrypt(description || ""), // Encrypt description
                category,
                startTime: new Date(startTime),
                endTime: endTime ? new Date(endTime) : null,
                duration: calculatedDuration || null,
            },
        });

        // Sync to Google Calendar
        try {
            const googleEventId = await createCalendarEvent(session.userId, activity);
            if (googleEventId) {
                await prisma.dailyActivity.update({
                    where: { id: activity.id },
                    data: {
                        googleEventId,
                        synced: true
                    },
                });
                return NextResponse.json({ ...activity, googleEventId, synced: true }, { status: 201 });
            }
        } catch (syncError) {
            console.error("Google Calendar sync failed:", syncError);
        }

        return NextResponse.json(activity, { status: 201 });
    } catch (error) {
        console.error("Failed to create activity:", error);
        return NextResponse.json(
            { error: "Failed to create activity" },
            { status: 500 }
        );
    }
}
