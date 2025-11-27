import { NextResponse } from "next/server";
import { google } from "googleapis";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { oauth2Client } from "@/lib/google";
import { checkSubscription } from "@/lib/subscription";

export async function POST() {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Check Subscription
    const { isPremium } = await checkSubscription(session.userId);
    if (!isPremium) {
        return NextResponse.json(
            { error: "Premium feature. Please upgrade to sync with Google Calendar." },
            { status: 403 }
        );
    }

    // 2. Get Google Tokens
    const googleAuth = await prisma.googleAuth.findUnique({
        where: { userId: session.userId },
    });

    if (!googleAuth) {
        return NextResponse.json(
            { error: "Google account not connected. Please connect in Profile." },
            { status: 400 }
        );
    }

    // 3. Setup Google Client
    oauth2Client.setCredentials({
        access_token: googleAuth.accessToken,
        refresh_token: googleAuth.refreshToken,
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    try {
        // 4. Fetch Unsynced Activities
        // We sync all future activities or updated ones. For simplicity, let's sync everything from today onwards that isn't synced or was updated.
        // For now, let's just find all activities for this user that don't have a googleEventId or were updated recently.
        // A simpler approach for MVP: Sync all activities from today onwards.

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const activities = await prisma.dailyActivity.findMany({
            where: {
                userId: session.userId,
                startTime: { gte: today },
                synced: false // Only sync what hasn't been synced
            },
        });

        let syncedCount = 0;

        for (const activity of activities) {
            const event = {
                summary: activity.title,
                description: activity.description || "",
                start: {
                    dateTime: activity.startTime.toISOString(),
                    timeZone: "Asia/Jakarta", // Adjust as needed or get from user pref
                },
                end: {
                    dateTime: activity.endTime
                        ? activity.endTime.toISOString()
                        : new Date(activity.startTime.getTime() + (activity.duration || 60) * 60000).toISOString(),
                    timeZone: "Asia/Jakarta",
                },
            };

            try {
                if (activity.googleEventId) {
                    // Update existing event
                    await calendar.events.update({
                        calendarId: "primary",
                        eventId: activity.googleEventId,
                        requestBody: event,
                    });
                } else {
                    // Insert new event
                    const { data } = await calendar.events.insert({
                        calendarId: "primary",
                        requestBody: event,
                    });

                    // Update DB with event ID
                    await prisma.dailyActivity.update({
                        where: { id: activity.id },
                        data: {
                            googleEventId: data.id,
                            synced: true
                        }
                    });
                }
                syncedCount++;
            } catch (err) {
                console.error(`Failed to sync activity ${activity.id}:`, err);
                // Continue to next activity
            }
        }

        return NextResponse.json({
            success: true,
            syncedCount,
            message: `Successfully synced ${syncedCount} activities.`
        });

    } catch (error: any) {
        console.error("Sync API Error:", error);
        if (error.code === 401 || (error.response && error.response.status === 401)) {
            // Token might be expired and refresh failed?
            return NextResponse.json({ error: "Google Auth expired. Please reconnect." }, { status: 401 });
        }
        return NextResponse.json({ error: "Failed to sync activities" }, { status: 500 });
    }
}
