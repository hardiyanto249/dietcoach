import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { checkMessageLimit, incrementMessageCount } from "@/lib/subscription";

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { message } = await request.json();

        // Check Message Limit
        const limitCheck = await checkMessageLimit(session.userId);
        if (!limitCheck.allowed) {
            return NextResponse.json(
                {
                    error: "Daily message limit reached. Please upgrade to Premium for unlimited chat.",
                    isLimitReached: true
                },
                { status: 403 }
            );
        }

        // 1. Fetch User Context
        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            include: {
                profile: true,
            },
        });

        if (!user || !user.profile) {
            return NextResponse.json({ error: "User profile not found" }, { status: 404 });
        }

        // 2. Fetch Today's Logs
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const foodLogs = await prisma.foodLog.findMany({
            where: {
                userId: session.userId,
                loggedAt: { gte: today, lt: tomorrow },
            },
        });

        const exerciseLogs = await prisma.exercise.findMany({
            where: {
                userId: session.userId,
                loggedAt: { gte: today, lt: tomorrow },
            },
        });

        const waterLogs = await prisma.waterIntake.findMany({
            where: {
                userId: session.userId,
                loggedAt: { gte: today, lt: tomorrow },
            },
        });

        // 3. Calculate Stats
        const caloriesConsumed = foodLogs.reduce((acc, log) => acc + log.calories, 0);
        const caloriesBurned = exerciseLogs.reduce((acc, log) => acc + log.caloriesBurned, 0);
        const waterConsumed = waterLogs.reduce((acc, log) => acc + log.glasses, 0);

        const targetCalories = user.profile.dailyCalories || user.profile.tdee || 2000;
        const remainingCalories = targetCalories - caloriesConsumed + caloriesBurned;

        // 4. Construct System Prompt
        const systemPrompt = `
You are a helpful and empathetic Diet Coach AI. Your goal is to assist the user in achieving their health goals (${(user.profile.goal || "healthy_living").replace('_', ' ')}).

**User Profile:**
- Name: ${user.name}
- Weight: ${user.profile.weight} kg
- Height: ${user.profile.height} cm
- Activity Level: ${user.profile.activityLevel}
- Daily Calorie Target: ${targetCalories} kcal

**Today's Status:**
- Calories Consumed: ${caloriesConsumed} kcal
- Calories Burned: ${caloriesBurned} kcal
- Remaining Budget: ${remainingCalories} kcal
- Water Intake: ${waterConsumed} / ${user.profile.waterIntakeTarget} glasses

**Instructions:**
1. **Low Calorie Warning:** If remaining calories are low (< 300) and user asks for food, suggest low-calorie, high-volume foods (e.g., salads, soups, fruits).
2. **"Earn" Calories:** If user wants to eat something high-calorie but is out of budget, calculate how much exercise (e.g., jogging, walking) is needed to "earn" it. Use their weight (${user.profile.weight} kg) for rough estimates.
   - Formula estimate: Jogging ~7 kcal/min, Walking ~4 kcal/min (adjust based on intensity).
3. **Over Budget Recovery:** If remaining calories are negative, be supportive. Suggest a "recovery plan" (e.g., light walk today, slightly lower calories tomorrow). Do NOT shame the user.
4. **General:** Be encouraging, keep answers concise (max 3-4 sentences unless detailed advice is asked), and use emojis.
5. **Language:** Speak in Indonesian (Bahasa Indonesia), casual but polite.

**QUEST SYSTEM (IMPORTANT):**
You must output your response in JSON format.
If the user's request implies an action (e.g., "I want to exercise", "What should I eat?", "I ate an apple"), you can generate a "Quest".
- **Quest Types:** "EXERCISE" (for workouts), "FOOD" (for healthy eating suggestions), "WATER" (for hydration).
- **XP:** Assign XP based on difficulty (e.g., 10-50 XP).

**JSON Schema:**
{
  "reply": "Your text response here...",
  "quest": {
    "type": "EXERCISE" | "FOOD" | "WATER",
    "title": "Short Quest Title",
    "description": "Description of the quest",
    "xp": number,
    "action": {
       "type": "LOG_EXERCISE" | "LOG_FOOD" | "LOG_WATER",
       "data": {
         // For LOG_EXERCISE:
         "exerciseName": "Jogging",
         "duration": 30,
         "caloriesBurned": 300
         
         // For LOG_FOOD:
         "foodName": "Apple",
         "calories": 95,
         "portion": "1 medium",
         "protein": 0,
         "carbs": 25,
         "fat": 0
       }
    }
  } // Optional, omit if no quest
}

**IMPORTANT**: Always include complete data in quest.action.data with all required fields!

**Current User Request:** "${message}"
`;

        // 5. Call OpenAI
        console.log("Calling OpenAI...");
        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: message },
                ],
                response_format: { type: "json_object" },
                max_tokens: 400,
            });

            const aiReplyRaw = response.choices[0].message.content;
            console.log("OpenAI Raw Response:", aiReplyRaw);

            if (!aiReplyRaw) {
                throw new Error("Empty response from OpenAI");
            }

            let aiReplyJson;
            try {
                aiReplyJson = JSON.parse(aiReplyRaw);
            } catch (parseError) {
                console.error("JSON Parse Error:", parseError);
                console.error("Raw Content:", aiReplyRaw);
                throw new Error("Failed to parse AI response");
            }

            // Increment message count if successful
            await incrementMessageCount(session.userId);

            return NextResponse.json(aiReplyJson);

        } catch (openaiError: any) {
            console.error("OpenAI/Processing Error:", openaiError);
            throw openaiError; // Re-throw to be caught by outer catch
        }

    } catch (error: any) {
        console.error("Chat API Fatal Error:", error);

        if (error.code === "invalid_api_key") {
            return NextResponse.json(
                { error: "OpenAI API key not configured." },
                { status: 500 }
            );
        }

        if (error.status === 429 || (error.message && error.message.includes("quota"))) {
            return NextResponse.json(
                { error: "OpenAI API quota exceeded." },
                { status: 429 }
            );
        }

        return NextResponse.json(
            { error: error.message || "Internal Server Error", details: error.toString() },
            { status: 500 }
        );
    }
}
