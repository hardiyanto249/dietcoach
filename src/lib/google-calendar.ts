import { google } from "googleapis";
import { oauth2Client } from "./google";
import prisma from "./prisma";

const calendar = google.calendar({ version: "v3", auth: oauth2Client });

async function getAuthenticatedClient(userId: string) {
    const googleAuth = await prisma.googleAuth.findUnique({
        where: { userId },
    });

    if (!googleAuth) {
        return null;
    }

    oauth2Client.setCredentials({
        access_token: googleAuth.accessToken,
        refresh_token: googleAuth.refreshToken,
        expiry_date: googleAuth.expiresAt.getTime(),
    });

    // Handle token refresh if needed (googleapis handles this automatically if refresh_token is present)
    // But we might want to update the DB with new tokens if they change.
    // For now, let's rely on googleapis auto-refresh.
    // Ideally, we should listen to 'tokens' event on oauth2Client, but it's a global instance.
    // A better approach for multi-user is to create a new OAuth2 client per request or handle token events.
    // Given the scale, setting credentials on the global instance sequentially is risky for concurrency.
    // BETTER APPROACH: Create a new OAuth2 client instance for each request.

    const newClient = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    newClient.setCredentials({
        access_token: googleAuth.accessToken,
        refresh_token: googleAuth.refreshToken,
        expiry_date: googleAuth.expiresAt.getTime(),
    });

    return newClient;
}

export async function createCalendarEvent(userId: string, activity: any) {
    const auth = await getAuthenticatedClient(userId);
    if (!auth) return null;

    const calendar = google.calendar({ version: "v3", auth });

    try {
        // Fetch user profile for reminder settings
        const userProfile = await prisma.dietProfile.findFirst({
            where: { user: { id: userId } }
        });

        const popupMinutes = userProfile?.calendarPopupMinutes || 10;
        const emailMinutes = userProfile?.calendarEmailMinutes || 30;

        const event = {
            summary: activity.title,
            description: activity.description,
            start: {
                dateTime: activity.startTime.toISOString(),
            },
            end: {
                dateTime: activity.endTime
                    ? activity.endTime.toISOString()
                    : new Date(activity.startTime.getTime() + (activity.duration || 60) * 60000).toISOString(),
            },
            colorId: getCategoryColorId(activity.category),
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'popup', minutes: popupMinutes },
                    { method: 'email', minutes: emailMinutes },
                ],
            },
        };

        const response = await calendar.events.insert({
            calendarId: "primary",
            requestBody: event,
        });

        return response.data.id;
    } catch (error) {
        console.error("Error creating calendar event:", error);
        return null;
    }
}

export async function updateCalendarEvent(userId: string, eventId: string, activity: any) {
    const auth = await getAuthenticatedClient(userId);
    if (!auth) return null;

    const calendar = google.calendar({ version: "v3", auth });

    try {
        // Fetch user profile for reminder settings
        const userProfile = await prisma.dietProfile.findFirst({
            where: { user: { id: userId } }
        });

        const popupMinutes = userProfile?.calendarPopupMinutes || 10;
        const emailMinutes = userProfile?.calendarEmailMinutes || 30;

        const event = {
            summary: activity.title,
            description: activity.description,
            start: {
                dateTime: activity.startTime.toISOString(),
            },
            end: {
                dateTime: activity.endTime
                    ? activity.endTime.toISOString()
                    : new Date(activity.startTime.getTime() + (activity.duration || 60) * 60000).toISOString(),
            },
            colorId: getCategoryColorId(activity.category),
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'popup', minutes: popupMinutes },
                    { method: 'email', minutes: emailMinutes },
                ],
            },
        };

        await calendar.events.update({
            calendarId: "primary",
            eventId: eventId,
            requestBody: event,
        });

        return true;
    } catch (error) {
        console.error("Error updating calendar event:", error);
        return false;
    }
}

export async function deleteCalendarEvent(userId: string, eventId: string) {
    const auth = await getAuthenticatedClient(userId);
    if (!auth) return null;

    const calendar = google.calendar({ version: "v3", auth });

    try {
        await calendar.events.delete({
            calendarId: "primary",
            eventId: eventId,
        });
        return true;
    } catch (error) {
        console.error("Error deleting calendar event:", error);
        return false;
    }
}

function getCategoryColorId(category: string): string {
    // Google Calendar Color IDs (approximate)
    // 1: Lavender, 2: Sage, 3: Grape, 4: Flamingo, 5: Banana, 6: Tangerine, 7: Peacock, 8: Graphite, 9: Blueberry, 10: Basil, 11: Tomato
    switch (category) {
        case "work": return "9"; // Blueberry (Blue)
        case "personal": return "3"; // Grape (Purple)
        case "health": return "10"; // Basil (Green)
        case "fitness": return "6"; // Tangerine (Orange)
        case "meal": return "11"; // Tomato (Red)
        default: return "8"; // Graphite (Gray)
    }
}
