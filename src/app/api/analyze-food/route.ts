import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getSession } from "@/lib/session";
import { checkSubscription } from "@/lib/subscription";

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const image = formData.get("image") as File;

        if (!image) {
            return NextResponse.json(
                { error: "No image provided" },
                { status: 400 }
            );
        }

        // Check Subscription
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { isPremium } = await checkSubscription(session.id);
        if (!isPremium) {
            return NextResponse.json(
                { error: "Premium feature. Please upgrade to use AI Food Recognition." },
                { status: 403 }
            );
        }

        // Convert image to base64
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Image = buffer.toString("base64");
        const mimeType = image.type;

        // Call OpenAI Vision API
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `Analyze this food image and provide:
1. List of all foods you can identify
2. Estimated portion size for each food
3. Estimated calories for each food item
4. Total calories

Format your response as JSON with this structure:
{
  "foods": [
    {
      "name": "food name in Indonesian",
      "portion": "portion description",
      "calories": number
    }
  ],
  "totalCalories": number,
  "confidence": "high/medium/low"
}

If you cannot identify the food clearly, set confidence to "low" and provide your best guess.`,
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:${mimeType};base64,${base64Image}`,
                            },
                        },
                    ],
                },
            ],
            max_tokens: 500,
        });

        const content = response.choices[0].message.content;

        // Parse the JSON response
        let result;
        try {
            // Extract JSON from markdown code block if present
            const jsonMatch = content?.match(/```json\n([\s\S]*?)\n```/) || content?.match(/```\n([\s\S]*?)\n```/);
            const jsonString = jsonMatch ? jsonMatch[1] : content;
            result = JSON.parse(jsonString || "{}");
        } catch (parseError) {
            // If parsing fails, return raw content
            return NextResponse.json({
                foods: [],
                totalCalories: 0,
                confidence: "low",
                rawResponse: content,
                error: "Failed to parse AI response",
            });
        }

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Food analysis error:", error);

        if (error.code === "invalid_api_key") {
            return NextResponse.json(
                { error: "OpenAI API key not configured. Please add OPENAI_API_KEY to .env file." },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: error.message || "Failed to analyze food image" },
            { status: 500 }
        );
    }
}
