"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CommunityRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/social");
    }, [router]);

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
}
