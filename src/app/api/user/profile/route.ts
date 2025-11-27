import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@/lib/session";

const prisma = new PrismaClient();

async function getUserId() {
    const session = await getSession();
    return session?.userId;
}

export async function GET(req: Request) {
    try {
        const userId = await getUserId();
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                profile: true,
                googleAuth: true,
            },
        });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            name: user.name,
            email: user.email,
            // @ts-ignore: Prisma client update failed
            image: user.image,
            dietProfile: user.profile ? {
                ...user.profile,
                currentWeight: user.profile.weight // Map weight to currentWeight for frontend compatibility
            } : null,
            googleConnected: !!user.googleAuth,
        });
    } catch (error: any) {
        console.error("Error fetching profile:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const userId = await getUserId();
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        console.log("Received profile update body:", body);

        let { gender, age, height, weight, targetWeight, activity, activityLevel, tdee, bmr, goal, waterIntakeTarget, waterReminderInterval, waterReminderEnabled, calendarPopupMinutes, calendarEmailMinutes } = body;

        // Handle field mapping
        const finalActivityLevel = activityLevel || activity || "sedentary";

        // Parse and Validate Numbers
        const finalAge = parseInt(age);
        const finalHeight = parseFloat(height);
        const finalWeight = parseFloat(weight);
        let finalTargetWeight = parseFloat(targetWeight);

        // Default target weight to current weight if missing
        if (isNaN(finalTargetWeight)) {
            finalTargetWeight = finalWeight;
        }

        if (isNaN(finalAge) || isNaN(finalHeight) || isNaN(finalWeight)) {
            console.error("Invalid numeric fields:", { age, height, weight });
            return NextResponse.json({ message: "Invalid numeric fields. Please check your input." }, { status: 400 });
        }

        // Calculate BMR if missing
        if (!bmr) {
            if (gender === "male") {
                bmr = (10 * finalWeight) + (6.25 * finalHeight) - (5 * finalAge) + 5;
            } else {
                bmr = (10 * finalWeight) + (6.25 * finalHeight) - (5 * finalAge) - 161;
            }
        }

        // Calculate TDEE if missing
        if (!tdee) {
            const multipliers: Record<string, number> = {
                sedentary: 1.2,
                light: 1.375,
                moderate: 1.55,
                active: 1.725,
                very_active: 1.9,
                extra: 1.9
            };
            const multiplier = multipliers[finalActivityLevel] || 1.2;
            tdee = bmr * multiplier;
        }

        // Calculate daily calories (TDEE - 500 for weight loss, or based on goal)
        let dailyCalories = Math.round(tdee);
        if (goal === "lose_weight") dailyCalories -= 500;
        else if (goal === "gain_muscle") dailyCalories += 300;
        else dailyCalories -= 500; // Default to weight loss if not specified or "maintain" logic needed (usually maintain is TDEE)

        // If goal is maintain, use TDEE
        if (goal === "maintain") dailyCalories = Math.round(tdee);

        const updateData = {
            gender,
            age: finalAge,
            height: finalHeight,
            weight: finalWeight,
            targetWeight: finalTargetWeight,
            activityLevel: finalActivityLevel,
            tdee: parseFloat(tdee),
            bmr: parseFloat(bmr),
            dailyCalories,
            goal: goal || "WEIGHT_LOSS",
            waterIntakeTarget: parseInt(waterIntakeTarget?.toString() || "8"),
            waterReminderInterval: parseInt(waterReminderInterval?.toString() || "60"),
            waterReminderEnabled: Boolean(waterReminderEnabled),
            calendarPopupMinutes: parseInt(calendarPopupMinutes?.toString() || "10"),
            calendarEmailMinutes: parseInt(calendarEmailMinutes?.toString() || "30"),
        };

        console.log("Saving profile data:", updateData);

        const profile = await prisma.dietProfile.upsert({
            where: { userId },
            update: updateData,
            create: {
                userId,
                ...updateData
            },
        });

        return NextResponse.json(profile);
    } catch (error: any) {
        console.error("Error saving profile:", error);
        return NextResponse.json({ message: "Internal Server Error", error: error.message, stack: error.stack }, { status: 500 });
    }
}
