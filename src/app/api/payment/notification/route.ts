import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Midtrans from "midtrans-client";

const apiClient = new Midtrans.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
    serverKey: process.env.MIDTRANS_SERVER_KEY || "",
    clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
});

export async function POST(request: Request) {
    try {
        const notificationJson = await request.json();

        // Verify notification signature (optional but recommended)
        // For simplicity, we trust the status for now in Sandbox

        const statusResponse = await apiClient.transaction.notification(notificationJson);
        const orderId = statusResponse.order_id;
        const transactionStatus = statusResponse.transaction_status;
        const fraudStatus = statusResponse.fraud_status;

        console.log(`Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}`);

        let newStatus = "PENDING";

        if (transactionStatus == 'capture') {
            if (fraudStatus == 'challenge') {
                newStatus = "CHALLENGE";
            } else if (fraudStatus == 'accept') {
                newStatus = "SUCCESS";
            }
        } else if (transactionStatus == 'settlement') {
            newStatus = "SUCCESS";
        } else if (transactionStatus == 'cancel' ||
            transactionStatus == 'deny' ||
            transactionStatus == 'expire') {
            newStatus = "FAILED";
        } else if (transactionStatus == 'pending') {
            newStatus = "PENDING";
        }

        // Update Transaction
        const transaction = await prisma.transaction.update({
            where: { id: orderId },
            data: { status: newStatus },
            include: { user: true }
        });

        // Activate Premium if SUCCESS
        if (newStatus === "SUCCESS") {
            const oneMonthFromNow = new Date();
            oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

            await prisma.user.update({
                where: { id: transaction.userId },
                data: {
                    subscriptionTier: "PREMIUM",
                    subscriptionExpiresAt: oneMonthFromNow
                }
            });
            console.log(`User ${transaction.userId} upgraded to PREMIUM.`);
        }

        return NextResponse.json({ status: "OK" });

    } catch (error) {
        console.error("Midtrans Notification Error:", error);
        return NextResponse.json({ status: "Error", message: "Notification failed" }, { status: 500 });
    }
}
