import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { updateCalendarEvent, deleteCalendarEvent } from "@/lib/google-calendar";

// PUT /api/activities/[id] - Update activity
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await request.json();
        const { title, description, category, startTime, endTime, duration } = body;

        // Check if activity exists and belongs to user
        const existing = await prisma.dailyActivity.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json({ error: "Activity not found" }, { status: 404 });
        }

        if (existing.userId !== session.userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Calculate duration if endTime is provided
        let calculatedDuration = duration;
        if (!calculatedDuration && endTime && startTime) {
            const start = new Date(startTime);
            const end = new Date(endTime);
            calculatedDuration = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
        }

        const updated = await prisma.dailyActivity.update({
            where: { id },
            data: {
                title: title || existing.title,
                description: description !== undefined ? description : existing.description,
                category: category || existing.category,
                startTime: startTime ? new Date(startTime) : existing.startTime,
                endTime: endTime ? new Date(endTime) : existing.endTime,
                duration: calculatedDuration !== undefined ? calculatedDuration : existing.duration,
            },
        });

        // Sync update to Google Calendar
        if (existing.googleEventId) {
            try {
                await updateCalendarEvent(session.userId, existing.googleEventId, updated);
            } catch (syncError) {
                console.error("Google Calendar update failed:", syncError);
            }
        }

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Failed to update activity:", error);
        return NextResponse.json(
            { error: "Failed to update activity" },
            { status: 500 }
        );
    }
}

// DELETE /api/activities/[id] - Delete activity
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;

        // Check if activity exists and belongs to user
        const existing = await prisma.dailyActivity.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json({ error: "Activity not found" }, { status: 404 });
        }

        if (existing.userId !== session.userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Sync delete to Google Calendar
        if (existing.googleEventId) {
            try {
                await deleteCalendarEvent(session.userId, existing.googleEventId);
            } catch (syncError) {
                console.error("Google Calendar delete failed:", syncError);
            }
        }

        await prisma.dailyActivity.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Activity deleted successfully" });
    } catch (error) {
        console.error("Failed to delete activity:", error);
        return NextResponse.json(
            { error: "Failed to delete activity" },
            { status: 500 }
        );
    }
}
