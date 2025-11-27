"use client";

import { useState, useEffect } from "react";
import { Users, MapPin, Heart, ArrowRight } from "lucide-react";
import Link from "next/link";

type Group = {
    id: string;
    name: string;
    description: string;
    category: string;
    membersCount: number;
    isJoined: boolean;
};

export default function GroupsPage() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/groups")
            .then((res) => res.json())
            .then((data) => {
                setGroups(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const joinGroup = async (id: string) => {
        try {
            const res = await fetch(`/api/groups/${id}/join`, { method: "POST" });
            if (res.ok) {
                setGroups((prev) =>
                    prev.map((g) =>
                        g.id === id ? { ...g, isJoined: true, membersCount: g.membersCount + 1 } : g
                    )
                );
            }
        } catch (error) {
            console.error("Failed to join group", error);
        }
    };

    return (
        <div className="container mx-auto p-4 pb-20">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Users className="text-blue-500" /> Community Groups
                </h1>
                <p className="text-slate-500 dark:text-slate-400">Connect with people who share your goals and location.</p>
            </header>

            {loading ? (
                <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {groups.map((group) => (
                        <div key={group.id} className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${group.category === 'CITY' ? 'bg-blue-100 text-blue-600' :
                                        group.category === 'AGE' ? 'bg-purple-100 text-purple-600' :
                                            'bg-orange-100 text-orange-600'
                                    }`}>
                                    {group.category}
                                </span>
                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                    <Users size={12} /> {group.membersCount}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold mb-2">{group.name}</h3>
                            <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-2">{group.description}</p>

                            {group.isJoined ? (
                                <Link href={`/community/groups/${group.id}`} className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                                    Open Chat <ArrowRight size={16} />
                                </Link>
                            ) : (
                                <button
                                    onClick={() => joinGroup(group.id)}
                                    className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-medium transition-colors"
                                >
                                    Join Group
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
