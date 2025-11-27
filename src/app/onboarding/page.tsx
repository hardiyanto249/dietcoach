"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import styles from "./onboarding.module.css";

type FormData = {
    gender: "male" | "female";
    age: string;
    height: string; // cm
    weight: string; // kg
    targetWeight: string;
    activity: "sedentary" | "light" | "moderate" | "active" | "extra";
};

export default function Onboarding() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [userId, setUserId] = useState<string | null>(null);
    const [data, setData] = useState<FormData>({
        gender: "male",
        age: "",
        height: "",
        weight: "",
        targetWeight: "",
        activity: "sedentary",
    });

    useEffect(() => {
        fetch("/api/auth/me")
            .then((res) => {
                if (res.ok) return res.json();
                throw new Error("Not logged in");
            })
            .then((data) => setUserId(data.id))
            .catch(() => router.push("/login"));
    }, [router]);

    const updateData = (key: keyof FormData, value: any) => {
        setData((prev) => ({ ...prev, [key]: value }));
    };

    const nextStep = () => setStep((p) => p + 1);
    const prevStep = () => setStep((p) => p - 1);

    const calculateBMR = () => {
        const w = parseFloat(data.weight) || 0;
        const h = parseFloat(data.height) || 0;
        const a = parseFloat(data.age) || 0;

        if (data.gender === "male") {
            return (10 * w) + (6.25 * h) - (5 * a) + 5;
        } else {
            return (10 * w) + (6.25 * h) - (5 * a) - 161;
        }
    };

    const calculateTDEE = () => {
        const bmr = calculateBMR();
        const multipliers = {
            sedentary: 1.2,
            light: 1.375,
            moderate: 1.55,
            active: 1.725,
            extra: 1.9,
        };
        return Math.round(bmr * multipliers[data.activity]);
    };

    return (
        <main className={styles.container}>
            <div className={`glass-panel ${styles.card} fade-in`}>
                <div className={styles.stepIndicator}>
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className={`${styles.stepDot} ${step >= i ? styles.stepDotActive : ""}`}
                        />
                    ))}
                </div>

                {step === 1 && (
                    <div className="fade-in">
                        <div className={styles.header}>
                            <h2 className={styles.title}>Tell us about yourself</h2>
                            <p style={{ color: '#94a3b8' }}>To calculate your personalized plan</p>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Gender</label>
                            <div className={styles.radioGroup}>
                                <label className={styles.radioLabel}>
                                    <input
                                        type="radio"
                                        className={styles.radioInput}
                                        checked={data.gender === "male"}
                                        onChange={() => updateData("gender", "male")}
                                    />
                                    <div className={styles.radioCard}>Male</div>
                                </label>
                                <label className={styles.radioLabel}>
                                    <input
                                        type="radio"
                                        className={styles.radioInput}
                                        checked={data.gender === "female"}
                                        onChange={() => updateData("gender", "female")}
                                    />
                                    <div className={styles.radioCard}>Female</div>
                                </label>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Age</label>
                            <input
                                type="number"
                                className="input-field"
                                placeholder="e.g. 25"
                                value={data.age}
                                onChange={(e) => updateData("age", e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="fade-in">
                        <div className={styles.header}>
                            <h2 className={styles.title}>Body Measurements</h2>
                            <p style={{ color: '#94a3b8' }}>Be as accurate as possible</p>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Height (cm)</label>
                            <input
                                type="number"
                                className="input-field"
                                placeholder="e.g. 175"
                                value={data.height}
                                onChange={(e) => updateData("height", e.target.value)}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Current Weight (kg)</label>
                            <input
                                type="number"
                                className="input-field"
                                placeholder="e.g. 70"
                                value={data.weight}
                                onChange={(e) => updateData("weight", e.target.value)}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Target Weight (kg)</label>
                            <input
                                type="number"
                                className="input-field"
                                placeholder="e.g. 65"
                                value={data.targetWeight}
                                onChange={(e) => updateData("targetWeight", e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="fade-in">
                        <div className={styles.header}>
                            <h2 className={styles.title}>Activity Level</h2>
                            <p style={{ color: '#94a3b8' }}>How active are you daily?</p>
                        </div>

                        <div className={styles.formGroup}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {[
                                    { val: "sedentary", label: "Sedentary (Office job, little exercise)" },
                                    { val: "light", label: "Lightly Active (1-3 days/week)" },
                                    { val: "moderate", label: "Moderately Active (3-5 days/week)" },
                                    { val: "active", label: "Very Active (6-7 days/week)" },
                                ].map((opt) => (
                                    <label key={opt.val} className={styles.radioLabel}>
                                        <input
                                            type="radio"
                                            className={styles.radioInput}
                                            checked={data.activity === opt.val}
                                            onChange={() => updateData("activity", opt.val)}
                                        />
                                        <div className={styles.radioCard} style={{ textAlign: 'left', paddingLeft: '1.5rem' }}>
                                            {opt.label}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className={`fade-in ${styles.resultContainer}`}>
                        <div className={styles.header}>
                            <h2 className={styles.title}>Your Daily Target</h2>
                            <p style={{ color: '#94a3b8' }}>Based on your TDEE</p>
                        </div>

                        <div style={{ padding: '1rem 0' }}>
                            <p className={styles.resultLabel}>Maintenance Calories</p>
                            <h1 className={styles.resultValue}>{calculateTDEE()} <span style={{ fontSize: '1.25rem', color: '#64748b' }}>kcal</span></h1>
                        </div>

                        <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--card-border)', marginBottom: '1.5rem' }}>
                            <p style={{ fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>Recommended for Weight Loss</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{calculateTDEE() - 500} kcal</p>
                        </div>

                        <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                            This is a starting point. I will adjust this as we go based on your progress!
                        </p>
                    </div>
                )}

                <div className={styles.buttonGroup}>
                    {step > 1 && step < 4 && (
                        <button onClick={prevStep} className={styles.backButton}>
                            Back
                        </button>
                    )}

                    {step < 4 ? (
                        <button
                            onClick={nextStep}
                            className="glass-button"
                            style={{ marginLeft: 'auto' }}
                            disabled={
                                (step === 1 && (!data.age)) ||
                                (step === 2 && (!data.height || !data.weight))
                            }
                        >
                            Next <ArrowRight size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={async () => {
                                const tdee = calculateTDEE();
                                const bmr = calculateBMR();
                                try {
                                    const res = await fetch("/api/user/profile", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ ...data, tdee, bmr }),
                                    });
                                    if (res.ok) {
                                        router.push('/chat');
                                    } else {
                                        alert("Failed to save profile");
                                    }
                                } catch (e) {
                                    console.error(e);
                                    alert("Error saving profile");
                                }
                            }}
                            className="glass-button"
                            style={{ width: '100%' }}
                        >
                            Start Chatting <Check size={18} />
                        </button>
                    )}
                </div>
            </div>
        </main>
    );
}
