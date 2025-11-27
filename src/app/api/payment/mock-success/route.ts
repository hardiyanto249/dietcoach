import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";

export async function POST() {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const oneMonthFromNow = new Date();
        oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

        // Upgrade user to PREMIUM
        await prisma.user.update({
            where: { id: session.userId },
            data: {
                subscriptionTier: "PREMIUM",
                subscriptionExpiresAt: oneMonthFromNow
            }
        });

        // Create a mock transaction record
        await prisma.transaction.create({
            data: {
                userId: session.userId,
                amount: 29900,
                status: "SUCCESS",
                snapToken: "MOCK_SUCCESS_TOKEN"
            }
        });

        return NextResponse.json({ success: true, message: "Mock upgrade successful" });

    } catch (error: any) {
        console.error("Mock Upgrade Error:", error);
        return NextResponse.json(
            { error: "Failed to process mock upgrade" },
            { status: 500 }
        );
    }
}
