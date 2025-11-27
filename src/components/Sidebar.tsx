"use client";

import { useRouter, usePathname } from "next/navigation";
import { LogOut, User, Calendar, BarChart2, ClipboardList, Users, Plus } from "lucide-react";
import styles from "@/app/chat/chat.module.css";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
    // Optional HUD props
    stats?: {
        caloriesConsumed: number;
        caloriesBurned: number;
        targetCalories: number;
        waterIntake: number;
        waterIntakeTarget: number;
        xp?: number;
        level?: number;
        levelTitle?: string;
        levelIcon?: string;
    };
    onAddWater?: (amount: number) => void;
    onOpenLog?: () => void;
}

export default function Sidebar({ isOpen, onClose, onLogout, stats, onAddWater, onOpenLog }: SidebarProps) {
    const router = useRouter();
    const pathname = usePathname();

    return (
        <>
            {/* Overlay */}
            <div
                className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ''}`}
                onClick={onClose}
            />

            <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`} style={{ paddingTop: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingLeft: '1rem', paddingRight: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', flexShrink: 0 }}>
                        DC
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'white', lineHeight: '1.3', margin: 0 }}>Diet Coach</h2>
                        <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.2', margin: 0 }}>Your AI Assistant</p>
                    </div>
                </div>

                {/* HUD (Only if stats provided) */}
                {stats && (
                    <div className="rpg-hud" style={{ borderRadius: '1rem', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem' }}>
                        {/* XP & Level Display */}
                        {stats.xp !== undefined && stats.level !== undefined && (
                            <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', gap: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', flex: 1, minWidth: 0 }}>
                                        <span style={{ fontSize: '1.5rem', lineHeight: 1, flexShrink: 0 }}>{stats.levelIcon || '⚡'}</span>
                                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#f59e0b', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
                                                Level {stats.level}
                                            </span>
                                            {stats.levelTitle && (
                                                <span style={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.2, marginTop: '2px', whiteSpace: 'nowrap' }}>
                                                    {stats.levelTitle}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="xp-badge" style={{ fontSize: '0.7rem', flexShrink: 0 }}>
                                        {stats.xp} XP
                                    </div>
                                </div>
                                {/* XP Progress Bar */}
                                {stats.level < 7 && (
                                    <>
                                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                                            {stats.xp % 100} / 100 XP to Level {stats.level + 1}
                                        </div>
                                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div
                                                style={{
                                                    height: '100%',
                                                    width: `${(stats.xp % 100)}%`,
                                                    background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)',
                                                    borderRadius: '3px',
                                                    transition: 'width 0.5s ease'
                                                }}
                                            />
                                        </div>
                                    </>
                                )}
                                {stats.level >= 7 && (
                                    <div style={{ fontSize: '0.7rem', color: '#fbbf24', textAlign: 'center', marginTop: '0.25rem' }}>
                                        ⭐ Max Level Reached! ⭐
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Calories & Water Display */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            {/* Calories */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '1.25rem' }}>🔥</span>
                                <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: '600' }}>Calories Left</span>
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1.5rem', paddingLeft: '0.25rem' }}>
                                {Math.max(0, stats.targetCalories - (stats.caloriesConsumed - stats.caloriesBurned))} / {stats.targetCalories} kcal
                            </div>

                            {/* Water */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '1.25rem' }}>💧</span>
                                <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: '600' }}>Water Intake</span>
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem', paddingLeft: '0.25rem' }}>
                                {stats.waterIntake}/{stats.waterIntakeTarget} glasses
                            </div>

                            {/* Water Progress Bar */}
                            <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                                <div
                                    style={{
                                        height: '100%',
                                        width: `${Math.min(100, (stats.waterIntake / stats.waterIntakeTarget) * 100)}%`,
                                        background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)',
                                        borderRadius: '4px',
                                        transition: 'width 0.5s ease'
                                    }}
                                />
                            </div>

                            {/* Water Controls */}
                            {onAddWater && (
                                <button
                                    onClick={() => onAddWater(1)}
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem',
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: 'white',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '4px'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <Plus size={14} /> Add Water
                                </button>
                            )}
                        </div>
                    </div>
                )}

                <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                    {onOpenLog && (
                        <button
                            onClick={onOpenLog}
                            className={styles.iconButton}
                            style={{ width: '100%', borderRadius: '0.5rem', justifyContent: 'flex-start', padding: '0.75rem', marginBottom: '0.5rem' }}
                        >
                            <ClipboardList size={20} style={{ marginRight: '0.5rem' }} />
                            Daily Log
                        </button>
                    )}

                    <button
                        onClick={() => router.push('/chat')}
                        className={styles.iconButton}
                        style={{ width: '100%', borderRadius: '0.5rem', justifyContent: 'flex-start', padding: '0.75rem', marginBottom: '0.5rem', background: pathname === '/chat' ? 'rgba(255,255,255,0.1)' : 'transparent' }}
                    >
                        <ClipboardList size={20} style={{ marginRight: '0.5rem' }} />
                        Chat & Tracker
                    </button>

                    <button
                        onClick={() => router.push('/social')}
                        className={styles.iconButton}
                        style={{ width: '100%', borderRadius: '0.5rem', justifyContent: 'flex-start', padding: '0.75rem', marginBottom: '0.5rem', background: pathname === '/social' ? 'rgba(255,255,255,0.1)' : 'transparent' }}
                    >
                        <Users size={20} style={{ marginRight: '0.5rem' }} />
                        Social Feed
                    </button>

                    <button
                        onClick={() => router.push('/activities')}
                        className={styles.iconButton}
                        style={{ width: '100%', borderRadius: '0.5rem', justifyContent: 'flex-start', padding: '0.75rem', marginBottom: '0.5rem', background: pathname === '/activities' ? 'rgba(255,255,255,0.1)' : 'transparent' }}
                    >
                        <Calendar size={20} style={{ marginRight: '0.5rem' }} />
                        Activities
                    </button>
                    <button
                        onClick={() => router.push('/analytics')}
                        className={styles.iconButton}
                        style={{ width: '100%', borderRadius: '0.5rem', justifyContent: 'flex-start', padding: '0.75rem', marginBottom: '0.5rem', background: pathname === '/analytics' ? 'rgba(255,255,255,0.1)' : 'transparent' }}
                    >
                        <BarChart2 size={20} style={{ marginRight: '0.5rem' }} />
                        Analytics
                    </button>
                    <button
                        onClick={() => router.push('/profile')}
                        className={styles.iconButton}
                        style={{ width: '100%', borderRadius: '0.5rem', justifyContent: 'flex-start', padding: '0.75rem', marginBottom: '0.5rem', background: pathname === '/profile' ? 'rgba(255,255,255,0.1)' : 'transparent' }}
                    >
                        <User size={20} style={{ marginRight: '0.5rem' }} />
                        Profile
                    </button>
                    <button
                        onClick={onLogout}
                        className={styles.iconButton}
                        style={{ width: '100%', borderRadius: '0.5rem', justifyContent: 'flex-start', padding: '0.75rem', color: '#ef4444' }}
                    >
                        <LogOut size={20} style={{ marginRight: '0.5rem' }} />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
}
