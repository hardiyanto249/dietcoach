import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: postId } = await params;
        const { content } = await request.json();

        if (!content || !content.trim()) {
            return NextResponse.json({ error: "Comment content is required" }, { status: 400 });
        }

        // Get user info from session (REQUIRED)
        const { getSession } = await import("@/lib/session");
        const session = await getSession();

        if (!session || !session.userId) {
            return NextResponse.json({ error: "Authentication required to comment" }, { status: 401 });
        }

        const userId = session.userId as string;
        const userName = session.name as string;

        // Save comment to database
        const newComment = await prisma.comment.create({
            data: {
                content,
                postId,
                userId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        console.log(`User ${userName} commented on post ${postId}: ${content}`);

        return NextResponse.json({
            success: true,
            comment: {
                id: newComment.id,
                postId: newComment.postId,
                userId: newComment.userId,
                userName: newComment.user.name,
                userEmail: newComment.user.email,
                content: newComment.content,
                createdAt: newComment.createdAt.toISOString()
            }
        });
    } catch (error) {
        console.error("Comment error:", error);
        return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: postId } = await params;

        // Fetch comments from database
        const comments = await prisma.comment.findMany({
            where: { postId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc' // Newest first
            }
        });

        // Format comments for response
        const formattedComments = comments.map(comment => ({
            id: comment.id,
            postId: comment.postId,
            userId: comment.userId,
            userName: comment.user.name,
            userEmail: comment.user.email,
            content: comment.content,
            createdAt: comment.createdAt.toISOString()
        }));

        return NextResponse.json({
            success: true,
            comments: formattedComments
        });
    } catch (error) {
        console.error("Fetch comments error:", error);
        return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
    }
}
