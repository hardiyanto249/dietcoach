import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

// GET /api/social/posts - Get Feed
export async function GET(request: NextRequest) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // For Phase 1, we fetch all posts to create a "Community Feed" feel
        const posts = await prisma.post.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                },
                likes: true,
                comments: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Format for UI
        const formattedPosts = posts.map(post => ({
            id: post.id,
            user: post.user,
            content: post.content,
            imageUrl: post.imageUrl,
            likesCount: post.likes.length,
            commentsCount: post.comments.length,
            isLiked: post.likes.some(like => like.userId === session.userId),
            createdAt: post.createdAt,
        }));

        return NextResponse.json(formattedPosts);
    } catch (error) {
        console.error("Feed error:", error);
        return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 });
    }
}

// POST /api/social/posts - Create Post
export async function POST(request: NextRequest) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { content, imageUrl } = await request.json();

        if (!content) {
            return NextResponse.json({ error: "Content is required" }, { status: 400 });
        }

        const post = await prisma.post.create({
            data: {
                userId: session.userId,
                content,
                imageUrl,
            }
        });

        return NextResponse.json(post);
    } catch (error) {
        console.error("Create post error:", error);
        return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
    }
}
