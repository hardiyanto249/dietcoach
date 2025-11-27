"use client";

import { useState, useEffect } from "react";
import { Heart, UserPlus, MessageCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

type Match = {
    id: string;
    name: string;
    age: number;
    gender: string;
    goal: string;
    matchScore: number;
};

export default function MatchPage() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLooking, setIsLooking] = useState(false);

    useEffect(() => {
        fetch("/api/match")
            .then((res) => res.json())
            .then((data) => {
                setMatches(data.matches || []);
                setIsLooking(data.isLooking);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const toggleLooking = async () => {
        try {
            const res = await fetch("/api/match/toggle", { method: "POST" });
            const data = await res.json();
            setIsLooking(data.isLooking);
            if (data.isLooking) {
                // Refresh matches
                window.location.reload();
            }
        } catch (error) {
            console.error("Error toggling status", error);
        }
    };

    return (
        <div className="container mx-auto p-4 pb-20">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Heart className="text-pink-500" /> Teman Diet
                </h1>
                <p className="text-slate-500 dark:text-slate-400">Find a diet buddy with similar goals!</p>
            </header>

            <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-700 mb-8 text-center">
                <h2 className="text-lg font-bold mb-2">Status: {isLooking ? "Looking for Buddy" : "Not Looking"}</h2>
                <p className="text-slate-500 mb-4">Enable this to appear in other users' searches.</p>
                <button
                    onClick={toggleLooking}
                    className={`px-6 py-2 rounded-full font-medium transition-colors ${isLooking
                            ? "bg-pink-100 text-pink-600 hover:bg-pink-200"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                >
                    {isLooking ? "Stop Looking" : "Start Looking"}
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                </div>
            ) : (
                <>
                    {isLooking && matches.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {matches.map((match) => (
                                <div key={match.id} className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-pink-500 font-bold text-xl">
                                            {match.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold">{match.name}</h3>
                                            <p className="text-xs text-slate-500">{match.age} y.o • {match.gender}</p>
                                        </div>
                                        <div className="ml-auto bg-green-100 text-green-600 px-2 py-1 rounded-lg text-xs font-bold">
                                            {match.matchScore}% Match
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl mb-4 text-sm text-slate-600 dark:text-slate-300">
                                        Goal: <span className="font-medium">{match.goal}</span>
                                    </div>

                                    <button className="w-full py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                                        <MessageCircle size={18} /> Chat Request
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : isLooking ? (
                        <div className="text-center py-10 text-slate-400">
                            No matches found yet. Check back later!
                        </div>
                    ) : null}
                </>
            )}
        </div>
    );
}
