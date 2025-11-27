"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Activity, Flame, Utensils, Droplet } from "lucide-react";

type DailyData = {
    date: string;
    day: string;
    caloriesConsumed: number;
    caloriesBurned: number;
    protein: number;
    carbs: number;
    fat: number;
};

export default function AnalyticsPage() {
    const router = useRouter();
    const [data, setData] = useState<DailyData[]>([]);
    const [waterData, setWaterData] = useState<{ date: string; glasses: number }[]>([]);
    const [waterTarget, setWaterTarget] = useState(8);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch weekly analytics
        fetch("/api/analytics/weekly")
            .then((res) => res.json())
            .then((data) => {
                setData(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });

        // Fetch water intake stats
        fetch("/api/water-intake/stats?days=7")
            .then((res) => res.json())
            .then((data) => setWaterData(data))
            .catch((err) => console.error(err));

        // Fetch user profile for water target
        fetch("/api/auth/me")
            .then((res) => res.json())
            .then((data) => {
                if (data.dietProfile?.waterIntakeTarget) {
                    setWaterTarget(data.dietProfile.waterIntakeTarget);
                }
            })
            .catch((err) => console.error(err));
    }, []);

    const maxCalories = Math.max(...data.map(d => d.caloriesConsumed), 2500);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)', color: 'white', padding: '2rem' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <button
                        onClick={() => router.back()}
                        style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Weekly Analytics</h1>
                </header>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>Loading data...</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        {/* Calories Chart */}
                        <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                <div style={{ padding: '0.5rem', background: 'rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: '#ef4444' }}>
                                    <Flame size={20} />
                                </div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Calories (Last 7 Days)</h3>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '200px', paddingBottom: '1.5rem' }}>
                                {data.map((day) => (
                                    <div key={day.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', height: '100%' }}>
                                        <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', position: 'relative' }}>
                                            {/* Consumed Bar */}
                                            <div
                                                style={{
                                                    width: '12px',
                                                    height: `${(day.caloriesConsumed / maxCalories) * 100}%`,
                                                    background: 'var(--primary)',
                                                    borderRadius: '4px',
                                                    position: 'relative',
                                                    transition: 'height 0.5s ease'
                                                }}
                                                title={`Consumed: ${day.caloriesConsumed}`}
                                            />
                                            {/* Burned Bar (Overlay or Side-by-side? Let's do side-by-side small) */}
                                            <div
                                                style={{
                                                    width: '8px',
                                                    height: `${(day.caloriesBurned / maxCalories) * 100}%`,
                                                    background: '#ef4444',
                                                    borderRadius: '4px',
                                                    marginLeft: '4px',
                                                    transition: 'height 0.5s ease'
                                                }}
                                                title={`Burned: ${day.caloriesBurned}`}
                                            />
                                        </div>
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{day.day}</span>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '10px', height: '10px', background: 'var(--primary)', borderRadius: '2px' }}></div> Consumed
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '10px', height: '10px', background: '#ef4444', borderRadius: '2px' }}></div> Burned
                                </div>
                            </div>
                        </div>

                        {/* Macros Chart */}
                        <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                <div style={{ padding: '0.5rem', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '8px', color: '#6366f1' }}>
                                    <Utensils size={20} />
                                </div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Average Macros</h3>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                {['Protein', 'Carbs', 'Fat'].map((macro) => {
                                    const key = macro.toLowerCase() as 'protein' | 'carbs' | 'fat';
                                    const avg = Math.round(data.reduce((acc, curr) => acc + curr[key], 0) / (data.length || 1));
                                    const color = key === 'protein' ? '#6366f1' : key === 'carbs' ? '#f43f5e' : '#eab308';

                                    return (
                                        <div key={macro} style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}>
                                            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Avg {macro}</p>
                                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: color }}>{avg}g</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Water Intake Chart */}
                        <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                <div style={{ padding: '0.5rem', background: 'rgba(2, 132, 199, 0.2)', borderRadius: '8px', color: '#0284c7' }}>
                                    <Droplet size={20} />
                                </div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Water Intake (Last 7 Days)</h3>
                            </div>

                            {/* Line Chart */}
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '200px', paddingBottom: '1.5rem', position: 'relative' }}>
                                {/* Horizontal grid lines */}
                                <div style={{ position: 'absolute', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.05)' }} />
                                    ))}
                                </div>

                                {waterData.map((day, index) => {
                                    const maxGlasses = Math.max(...waterData.map(d => d.glasses), waterTarget);
                                    const height = (day.glasses / maxGlasses) * 100;
                                    const prevDay = index > 0 ? waterData[index - 1] : null;

                                    return (
                                        <div key={day.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', height: '100%', position: 'relative' }}>
                                            <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', position: 'relative' }}>
                                                {/* Data point */}
                                                <div
                                                    style={{
                                                        width: '8px',
                                                        height: '8px',
                                                        background: day.glasses >= waterTarget ? '#10b981' : '#0284c7',
                                                        borderRadius: '50%',
                                                        position: 'absolute',
                                                        bottom: `${height}%`,
                                                        transform: 'translateY(50%)',
                                                        zIndex: 2,
                                                        border: '2px solid rgba(15, 23, 42, 0.6)'
                                                    }}
                                                    title={`${day.glasses} glasses`}
                                                />

                                                {/* Line to previous point */}
                                                {prevDay && (
                                                    <svg style={{ position: 'absolute', width: '100%', height: '100%', left: '-50%', pointerEvents: 'none' }}>
                                                        <line
                                                            x1="100%"
                                                            y1={`${100 - ((prevDay.glasses / maxGlasses) * 100)}%`}
                                                            x2="200%"
                                                            y2={`${100 - height}%`}
                                                            stroke="#0284c7"
                                                            strokeWidth="2"
                                                        />
                                                    </svg>
                                                )}
                                            </div>
                                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Stats */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}>
                                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Avg Daily</p>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0284c7' }}>
                                        {Math.round(waterData.reduce((acc, curr) => acc + curr.glasses, 0) / (waterData.length || 1))} glasses
                                    </p>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}>
                                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Target Achievement</p>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                                        {Math.round((waterData.filter(d => d.glasses >= waterTarget).length / (waterData.length || 1)) * 100)}%
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}
