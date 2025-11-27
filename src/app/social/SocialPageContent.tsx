"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, Image as ImageIcon, ArrowLeft, Share2, X } from "lucide-react";

interface Post { id: string; user: { id: string; name: string }; content: string; imageUrl?: string; likesCount: number; commentsCount: number; isLiked: boolean; createdAt: string; }
interface UserProfile { name: string; email: string; }
interface Comment { id: string; postId: string; userId: string; userName: string; content: string; createdAt: string; }

export default function SocialPageContent() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [posts, setPosts] = useState<Post[]>([]);
    const [newPostContent, setNewPostContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [commentModalOpen, setCommentModalOpen] = useState(false);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [replyModalOpen, setReplyModalOpen] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
    const [selectedCommentUserName, setSelectedCommentUserName] = useState<string>("");
    const [commentContent, setCommentContent] = useState("");
    const [replyContent, setReplyContent] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);
    const [submittingReply, setSubmittingReply] = useState(false);
    const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
    const [postComments, setPostComments] = useState<Record<string, Comment[]>>({});
    const [loadingComments, setLoadingComments] = useState<Set<string>>(new Set());

    useEffect(() => {
        setMounted(true);
        fetchPosts();
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const res = await fetch("/api/user/profile");
            if (res.ok) {
                const data = await res.json();
                setUserProfile(data);
            } else {
                setUserProfile({ name: "User", email: "" });
            }
        } catch (error) {
            setUserProfile({ name: "User", email: "" });
        }
    };

    const fetchPosts = async () => {
        try {
            const res = await fetch("/api/social/posts");
            if (res.ok) {
                const data = await res.json();
                setPosts(data);
            }
        } catch (error) {
            console.error("Failed to fetch posts:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setSelectedImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleCreatePost = async () => {
        if (!newPostContent.trim() && !selectedImage) return;
        setPosting(true);
        try {
            const res = await fetch("/api/social/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: newPostContent, imageUrl: selectedImage }),
            });
            if (res.ok) {
                setNewPostContent("");
                setSelectedImage(null);
                fetchPosts();
            }
        } catch (error) {
            console.error("Failed to create post:", error);
        } finally {
            setPosting(false);
        }
    };

    const handleLike = async (postId: string) => {
        setPosts(prev => prev.map(post => post.id === postId ? { ...post, isLiked: !post.isLiked, likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1 } : post));
        try {
            await fetch(`/api/social/posts/${postId}/like`, { method: "POST" });
        } catch (error) {
            console.error("Failed to like post:", error);
            fetchPosts();
        }
    };

    const handleComment = (postId: string) => {
        console.log("COMMENT CLICKED!", postId);
        setSelectedPostId(postId);
        setCommentModalOpen(true);
        console.log("Modal state set to true");
    };

    const handleShare = (postId: string) => {
        setSelectedPostId(postId);
        setShareModalOpen(true);
    };

    const handleReplyToComment = (commentId: string, commentUserName: string, postId: string) => {
        setSelectedCommentId(commentId);
        setSelectedCommentUserName(commentUserName);
        setSelectedPostId(postId);
        setReplyModalOpen(true);
    };

    const handleSubmitComment = async () => {
        if (!commentContent.trim() || !selectedPostId) return;
        setSubmittingComment(true);
        try {
            const res = await fetch(`/api/social/posts/${selectedPostId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify({ content: commentContent }),
            });

            if (res.status === 401) {
                alert("Anda harus login terlebih dahulu untuk berkomentar!");
                router.push("/login");
                return;
            }

            if (res.ok) {
                setCommentContent("");
                setCommentModalOpen(false);
                setPosts(prev => prev.map(p => p.id === selectedPostId ? { ...p, commentsCount: p.commentsCount + 1 } : p));
                if (expandedPosts.has(selectedPostId)) await fetchComments(selectedPostId);
            } else {
                const error = await res.json();
                alert(`Gagal mengirim komentar: ${error.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error(error);
            alert("Terjadi kesalahan saat mengirim komentar");
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleSubmitReply = async () => {
        if (!replyContent.trim() || !selectedPostId) return;
        setSubmittingReply(true);
        try {
            const res = await fetch(`/api/social/posts/${selectedPostId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify({ content: `@${selectedCommentUserName} ${replyContent}` }),
            });

            if (res.status === 401) {
                alert("Anda harus login terlebih dahulu untuk membalas komentar!");
                router.push("/login");
                return;
            }

            if (res.ok) {
                setReplyContent("");
                setReplyModalOpen(false);
                setPosts(prev => prev.map(p => p.id === selectedPostId ? { ...p, commentsCount: p.commentsCount + 1 } : p));
                if (expandedPosts.has(selectedPostId)) await fetchComments(selectedPostId);
            } else {
                const error = await res.json();
                alert(`Gagal membalas komentar: ${error.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error(error);
            alert("Terjadi kesalahan saat membalas komentar");
        } finally {
            setSubmittingReply(false);
        }
    };

    const fetchComments = async (postId: string) => {
        setLoadingComments(prev => new Set(prev).add(postId));
        try {
            const res = await fetch(`/api/social/posts/${postId}/comments`);
            if (res.ok) {
                const data = await res.json();
                setPostComments(prev => ({ ...prev, [postId]: data.comments }));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingComments(prev => {
                const s = new Set(prev);
                s.delete(postId);
                return s;
            });
        }
    };

    const toggleComments = async (postId: string) => {
        const newSet = new Set(expandedPosts);
        if (!newSet.has(postId)) await fetchComments(postId);
        newSet.has(postId) ? newSet.delete(postId) : newSet.add(postId);
        setExpandedPosts(newSet);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(`${window.location.origin}/social/post/${selectedPostId}`);
        alert("Link disalin!");
        setShareModalOpen(false);
    };

    const getUserInitial = (name: string) => name?.charAt(0).toUpperCase() || "U";

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-gray-800">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
                    <button onClick={() => router.push("/chat")} className="p-2 hover:bg-gray-900 rounded-full transition">
                        <ArrowLeft size={24} />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold">Community</h1>
                        <p className="text-sm text-gray-500">{posts.length} posts today</p>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto">
                <div className="border-b border-gray-800 p-4">
                    <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold flex-shrink-0">
                            {getUserInitial(userProfile?.name || "")}
                        </div>
                        <div className="flex-1">
                            <textarea
                                rows={3}
                                value={newPostContent}
                                onChange={(e) => setNewPostContent(e.target.value)}
                                placeholder="Share your progress..."
                                style={{ color: '#ffffff' }}
                                className="w-full bg-transparent text-base resize-none outline-none placeholder-gray-600"
                            />

                            {selectedImage && (
                                <div className="mt-3 relative rounded-2xl overflow-hidden">
                                    <img src={selectedImage} alt="preview" className="w-full" />
                                    <button onClick={() => setSelectedImage(null)} className="absolute top-2 right-2 p-1.5 bg-black/70 rounded-full hover:bg-black">
                                        <X size={16} />
                                    </button>
                                </div>
                            )}

                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800">
                                <label className="cursor-pointer p-2 hover:bg-gray-900 rounded-full transition">
                                    <ImageIcon size={20} className="text-purple-500" />
                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                </label>

                                <button
                                    onClick={handleCreatePost}
                                    disabled={posting || (!newPostContent.trim() && !selectedImage)}
                                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-full font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    {posting ? "Posting..." : "Post"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-20 px-4">
                        <p className="text-xl font-semibold mb-2">No posts yet</p>
                        <p className="text-gray-500">Be the first to share!</p>
                    </div>
                ) : (
                    <div>
                        {posts.map((post) => (
                            <div key={post.id} className="border-b border-gray-800 p-4 hover:bg-gray-900/30 transition">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold flex-shrink-0">
                                        {getUserInitial(post.user.name)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold">{post.user.name}</span>
                                            <span className="text-gray-500 text-sm">·</span>
                                            <span className="text-gray-500 text-sm">
                                                {new Date(post.createdAt).toLocaleDateString("id-ID", { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>

                                        <p className="text-base mb-3 whitespace-pre-wrap break-words">{post.content}</p>

                                        {post.imageUrl && (
                                            <div className="mb-3 rounded-2xl overflow-hidden border border-gray-800">
                                                <img src={post.imageUrl} alt="post" className="w-full" />
                                            </div>
                                        )}

                                        <div className="flex items-center gap-6 text-gray-500">
                                            <button onClick={() => handleLike(post.id)} className={`flex items-center gap-2 hover:text-red-500 transition ${post.isLiked ? 'text-red-500' : ''}`}>
                                                <Heart size={18} fill={post.isLiked ? "currentColor" : "none"} />
                                                <span className="text-sm">{post.likesCount}</span>
                                            </button>

                                            <button onClick={() => handleComment(post.id)} className="flex items-center gap-2 hover:text-purple-500 transition">
                                                <MessageCircle size={18} />
                                                <span className="text-sm">{post.commentsCount}</span>
                                            </button>

                                            <button onClick={() => handleShare(post.id)} className="flex items-center gap-2 hover:text-green-500 transition ml-auto">
                                                <Share2 size={18} />
                                            </button>
                                        </div>

                                        {post.commentsCount > 0 && (
                                            <button onClick={() => toggleComments(post.id)} className="mt-3 text-sm text-purple-500 hover:text-purple-400">
                                                {expandedPosts.has(post.id) ? "Hide" : "View"} {post.commentsCount} comments
                                            </button>
                                        )}

                                        {expandedPosts.has(post.id) && (
                                            <div className="mt-4 space-y-3 pl-4 border-l-2 border-gray-800">
                                                {loadingComments.has(post.id) ? (
                                                    <div className="flex justify-center py-4">
                                                        <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                                    </div>
                                                ) : postComments[post.id]?.length ? (
                                                    postComments[post.id].map(c => (
                                                        <div key={c.id} className="group">
                                                            <div className="flex gap-2">
                                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                                    {c.userName[0].toUpperCase()}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="bg-gray-900 rounded-2xl px-3 py-2">
                                                                        <p className="font-semibold text-sm">{c.userName}</p>
                                                                        <p className="text-sm">{c.content}</p>
                                                                    </div>
                                                                    <button onClick={() => handleReplyToComment(c.id, c.userName, post.id)} className="mt-1 ml-3 text-xs text-gray-500 hover:text-purple-500 opacity-0 group-hover:opacity-100 transition">
                                                                        Reply
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-gray-500 text-sm text-center py-4">No comments yet</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {mounted && commentModalOpen && createPortal(
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 99999,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4"
                    onClick={() => setCommentModalOpen(false)}
                >
                    <div className="bg-gray-900 rounded-3xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold">Add Comment</h3>
                            <button onClick={() => setCommentModalOpen(false)} className="p-2 hover:bg-gray-800 rounded-full">
                                <X size={20} />
                            </button>
                        </div>
                        <textarea
                            rows={4}
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            placeholder="Share your thoughts..."
                            className="w-full bg-black border border-gray-800 rounded-2xl px-4 py-3 text-white placeholder-gray-600 resize-none outline-none focus:border-purple-500"
                        />
                        <div className="flex justify-end gap-3 mt-4">
                            <button onClick={() => setCommentModalOpen(false)} className="px-6 py-2 hover:bg-gray-800 rounded-full font-semibold">
                                Cancel
                            </button>
                            <button onClick={handleSubmitComment} disabled={submittingComment || !commentContent.trim()} className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-full font-semibold disabled:opacity-50">
                                {submittingComment ? "Posting..." : "Post"}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {mounted && replyModalOpen && createPortal(
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 99999,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4"
                    onClick={() => setReplyModalOpen(false)}
                >
                    <div className="bg-gray-900 rounded-3xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-bold">Reply to Comment</h3>
                                <p className="text-sm text-gray-500">@{selectedCommentUserName}</p>
                            </div>
                            <button onClick={() => setReplyModalOpen(false)} className="p-2 hover:bg-gray-800 rounded-full">
                                <X size={20} />
                            </button>
                        </div>
                        <textarea
                            rows={4}
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder={`Reply to @${selectedCommentUserName}...`}
                            className="w-full bg-black border border-gray-800 rounded-2xl px-4 py-3 text-white placeholder-gray-600 resize-none outline-none focus:border-purple-500"
                        />
                        <div className="flex justify-end gap-3 mt-4">
                            <button onClick={() => setReplyModalOpen(false)} className="px-6 py-2 hover:bg-gray-800 rounded-full font-semibold">
                                Cancel
                            </button>
                            <button onClick={handleSubmitReply} disabled={submittingReply || !replyContent.trim()} className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-full font-semibold disabled:opacity-50">
                                {submittingReply ? "Posting..." : "Reply"}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {mounted && shareModalOpen && createPortal(
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 99999,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4"
                    onClick={() => setShareModalOpen(false)}
                >
                    <div className="bg-gray-900 rounded-3xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold">Share Post</h3>
                            <button onClick={() => setShareModalOpen(false)} className="p-2 hover:bg-gray-800 rounded-full">
                                <X size={20} />
                            </button>
                        </div>
                        <button onClick={handleCopyLink} className="w-full flex items-center gap-3 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-2xl transition">
                            <Share2 size={20} className="text-purple-500" />
                            <span className="font-semibold">Copy Link</span>
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
