import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; commentId: string }> }
) {
    try {
        const { id: postId, commentId } = await params;
        const { content } = await request.json();

        if (!content || !content.trim()) {
            return NextResponse.json({ error: "Comment content is required" }, { status: 400 });
        }

        // Get user info from session
        const { getSession } = await import("@/lib/session");
        const session = await getSession();

        if (!session || !session.userId) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const userId = session.userId as string;

        // Check if comment exists and belongs to user
        const existingComment = await prisma.comment.findUnique({
            where: { id: commentId },
        });

        if (!existingComment) {
            return NextResponse.json({ error: "Comment not found" }, { status: 404 });
        }

        if (existingComment.userId !== userId) {
            return NextResponse.json({ error: "Unauthorized to edit this comment" }, { status: 403 });
        }

        // Update comment
        const updatedComment = await prisma.comment.update({
            where: { id: commentId },
            data: { content },
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

        return NextResponse.json({
            success: true,
            comment: {
                id: updatedComment.id,
                postId: updatedComment.postId,
                userId: updatedComment.userId,
                userName: updatedComment.user.name,
                userEmail: updatedComment.user.email,
                content: updatedComment.content,
                createdAt: updatedComment.createdAt.toISOString()
            }
        });
    } catch (error) {
        console.error("Edit comment error:", error);
        return NextResponse.json({ error: "Failed to edit comment" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; commentId: string }> }
) {
    try {
        const { id: postId, commentId } = await params;

        // Get user info from session
        const { getSession } = await import("@/lib/session");
        const session = await getSession();

        if (!session || !session.userId) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const userId = session.userId as string;

        // Check if comment exists and belongs to user
        const existingComment = await prisma.comment.findUnique({
            where: { id: commentId },
        });

        if (!existingComment) {
            return NextResponse.json({ error: "Comment not found" }, { status: 404 });
        }

        if (existingComment.userId !== userId) {
            return NextResponse.json({ error: "Unauthorized to delete this comment" }, { status: 403 });
        }

        // Delete comment
        await prisma.comment.delete({
            where: { id: commentId },
        });

        return NextResponse.json({
            success: true,
            message: "Comment deleted successfully"
        });
    } catch (error) {
        console.error("Delete comment error:", error);
        return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
    }
}
