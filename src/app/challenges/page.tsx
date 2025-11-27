"use client";

import { useState, useEffect } from "react";
import { Trophy, Calendar, Users, ArrowRight } from "lucide-react";
import Link from "next/link";

type Challenge = {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    targetType: string;
    targetValue: number;
    participantsCount: number;
    isJoined: boolean;
};

export default function ChallengesPage() {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/challenges")
            .then((res) => res.json())
            .then((data) => {
                setChallenges(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const joinChallenge = async (id: string) => {
        try {
            const res = await fetch(`/api/challenges/${id}/join`, { method: "POST" });
            if (res.ok) {
                setChallenges((prev) =>
                    prev.map((c) =>
                        c.id === id ? { ...c, isJoined: true, participantsCount: c.participantsCount + 1 } : c
                    )
                );
            }
        } catch (error) {
            console.error("Failed to join challenge", error);
        }
    };

    return (
        <div className="container mx-auto p-4 pb-20">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Trophy className="text-yellow-500" /> Weekly Challenges
                </h1>
                <p className="text-slate-500 dark:text-slate-400">Join challenges to earn badges and stay motivated!</p>
            </header>

            {loading ? (
                <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {challenges.map((challenge) => (
                        <div key={challenge.id} className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-700 relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-bl-xl text-xs font-bold">
                                {new Date(challenge.endDate) > new Date() ? "ACTIVE" : "ENDED"}
                            </div>

                            <h3 className="text-lg font-bold mb-2">{challenge.title}</h3>
                            <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">{challenge.description}</p>

                            <div className="flex items-center gap-4 text-xs text-slate-500 mb-6">
                                <div className="flex items-center gap-1">
                                    <Calendar size={14} />
                                    <span>{new Date(challenge.endDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Users size={14} />
                                    <span>{challenge.participantsCount} joined</span>
                                </div>
                            </div>

                            {challenge.isJoined ? (
                                <button disabled className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl font-medium cursor-not-allowed">
                                    Joined
                                </button>
                            ) : (
                                <button
                                    onClick={() => joinChallenge(challenge.id)}
                                    className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    Join Challenge <ArrowRight size={16} />
                                </button>
                            )}
                        </div>
                    ))}

                    {challenges.length === 0 && (
                        <div className="col-span-full text-center py-10 text-slate-400">
                            No active challenges at the moment. Check back later!
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
