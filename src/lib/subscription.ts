import prisma from "./prisma";

export const FREE_MESSAGE_LIMIT = 10;

export async function checkSubscription(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { subscriptionTier: true, subscriptionExpiresAt: true }
    });

    if (!user) return { isPremium: false };

    const isPremium = user.subscriptionTier === "PREMIUM" &&
        (!user.subscriptionExpiresAt || new Date(user.subscriptionExpiresAt) > new Date());

    return { isPremium };
}

export async function checkMessageLimit(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            subscriptionTier: true,
            subscriptionExpiresAt: true,
            messageCount: true,
            lastMessageDate: true
        }
    });

    if (!user) return { allowed: false, reason: "User not found" };

    // Check Premium
    const isPremium = user.subscriptionTier === "PREMIUM" &&
        (!user.subscriptionExpiresAt || new Date(user.subscriptionExpiresAt) > new Date());

    if (isPremium) return { allowed: true, isPremium: true };

    // Check Free Limit
    const today = new Date();
    const lastDate = new Date(user.lastMessageDate);

    // Reset count if new day
    if (lastDate.getDate() !== today.getDate() ||
        lastDate.getMonth() !== today.getMonth() ||
        lastDate.getFullYear() !== today.getFullYear()) {

        await prisma.user.update({
            where: { id: userId },
            data: { messageCount: 0, lastMessageDate: today }
        });
        return { allowed: true, remaining: FREE_MESSAGE_LIMIT, isPremium: false };
    }

    if (user.messageCount >= FREE_MESSAGE_LIMIT) {
        return { allowed: false, reason: "Daily limit reached", isPremium: false };
    }

    return { allowed: true, remaining: FREE_MESSAGE_LIMIT - user.messageCount, isPremium: false };
}

export async function incrementMessageCount(userId: string) {
    await prisma.user.update({
        where: { id: userId },
        data: {
            messageCount: { increment: 1 },
            lastMessageDate: new Date()
        }
    });
}
