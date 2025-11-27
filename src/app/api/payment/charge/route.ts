import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";
import Midtrans from "midtrans-client";

const snap = new Midtrans.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
    serverKey: process.env.MIDTRANS_SERVER_KEY || "",
    clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
});

export async function POST() {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check for Mock Mode
    if (!process.env.MIDTRANS_SERVER_KEY || process.env.MIDTRANS_SERVER_KEY.includes("SB-Mid-server-xxxx")) {
        console.log("Midtrans keys missing. Using Mock Mode.");
        return NextResponse.json({
            token: "MOCK_TOKEN_" + Date.now(),
            isMock: true
        });
    }

    try {
        // Create Transaction in DB
        const transaction = await prisma.transaction.create({
            data: {
                userId: session.userId,
                amount: 29900, // Fixed price for now
                status: "PENDING",
            },
        });

        // Create Snap Transaction
        const parameter = {
            transaction_details: {
                order_id: transaction.id,
                gross_amount: 29900,
            },
            customer_details: {
                email: session.email,
                first_name: session.name,
            },
            item_details: [{
                id: "PREMIUM_SUB",
                price: 29900,
                quantity: 1,
                name: "Diet Coach Premium (1 Month)",
            }]
        };

        const snapResponse = await snap.createTransaction(parameter);

        // Update DB with token
        await prisma.transaction.update({
            where: { id: transaction.id },
            data: { snapToken: snapResponse.token }
        });

        return NextResponse.json({ token: snapResponse.token });

    } catch (error: any) {
        console.error("Payment Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to initiate payment", details: error.toString() },
            { status: 500 }
        );
    }
}
