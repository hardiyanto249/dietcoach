import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getTokens, getUserProfile } from "@/lib/google";

export async function GET(request: NextRequest) {
    const session = await getSession();
    if (!session) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
        return NextResponse.redirect(new URL("/profile?error=google_auth_failed", request.url));
    }

    if (!code) {
        return NextResponse.redirect(new URL("/profile?error=no_code", request.url));
    }

    try {
        const tokens = await getTokens(code);

        // Save tokens to database
        await prisma.googleAuth.upsert({
            where: { userId: session.userId },
            update: {
                accessToken: tokens.access_token!,
                refreshToken: tokens.refresh_token!,
                expiresAt: new Date(tokens.expiry_date!),
            },
            create: {
                userId: session.userId,
                accessToken: tokens.access_token!,
                refreshToken: tokens.refresh_token!, // Important: First time only usually
                expiresAt: new Date(tokens.expiry_date!),
            },
        });

        // Fetch and save user profile picture
        try {
            const profile = await getUserProfile(tokens.access_token!);
            if (profile.picture) {
                await prisma.user.update({
                    where: { id: session.userId },
                    // @ts-ignore: Prisma client update failed due to file lock
                    data: { image: profile.picture },
                });
            }
        } catch (profileError) {
            console.error("Failed to fetch/save Google profile:", profileError);
            // Don't fail the whole auth process if profile fetch fails
        }

        return NextResponse.redirect(new URL("/profile?success=google_connected", request.url));
    } catch (error) {
        console.error("Google Auth Error:", error);
        return NextResponse.redirect(new URL("/profile?error=token_exchange_failed", request.url));
    }
}
