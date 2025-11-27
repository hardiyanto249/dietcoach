import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
    const session = await getSession();

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.userId as string;

    try {
        const today = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const foodLogs = await prisma.foodLog.findMany({
            where: {
                userId: userId,
                loggedAt: {
                    gte: sevenDaysAgo,
                },
            },
        });

        const exerciseLogs = await prisma.exercise.findMany({
            where: {
                userId: userId,
                loggedAt: {
                    gte: sevenDaysAgo,
                },
            },
        });

        // Group by date
        const dailyData: { [key: string]: any } = {};

        // Initialize last 7 days
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            dailyData[dateStr] = {
                date: dateStr,
                day: d.toLocaleDateString('en-US', { weekday: 'short' }),
                caloriesConsumed: 0,
                caloriesBurned: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
            };
        }

        foodLogs.forEach(log => {
            const dateStr = log.loggedAt.toISOString().split('T')[0];
            if (dailyData[dateStr]) {
                dailyData[dateStr].caloriesConsumed += log.calories;
                dailyData[dateStr].protein += log.protein;
                dailyData[dateStr].carbs += log.carbs;
                dailyData[dateStr].fat += log.fat;
            }
        });

        exerciseLogs.forEach(log => {
            const dateStr = log.loggedAt.toISOString().split('T')[0];
            if (dailyData[dateStr]) {
                dailyData[dateStr].caloriesBurned += log.caloriesBurned;
            }
        });

        // Convert to array and sort by date
        const result = Object.values(dailyData).sort((a: any, b: any) => a.date.localeCompare(b.date));

        return NextResponse.json(result);
    } catch (error) {
        console.error("Analytics error:", error);
        return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
    }
}
