"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Save, User, Calendar, CheckCircle, AlertCircle, Droplet } from "lucide-react";
import styles from "./profile.module.css";

function ProfileContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [googleConnected, setGoogleConnected] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        age: "",
        gender: "male",
        height: "",
        weight: "",
        targetWeight: "",
        activityLevel: "sedentary",
        goal: "maintain",
        waterIntakeTarget: "8",
        waterReminderInterval: "10",
        waterReminderEnabled: true,
        calendarPopupMinutes: "10",
        calendarEmailMinutes: "30",
    });
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        fetch("/api/user/profile")
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    // Handle error
                } else {
                    setFormData({
                        name: data.name || "",
                        age: data.dietProfile?.age || "",
                        gender: data.dietProfile?.gender || "male",
                        height: data.dietProfile?.height || "",
                        weight: data.dietProfile?.currentWeight || "",
                        targetWeight: data.dietProfile?.targetWeight || "",
                        activityLevel: data.dietProfile?.activityLevel || "sedentary",
                        goal: data.dietProfile?.goal || "maintain",
                        waterIntakeTarget: data.dietProfile?.waterIntakeTarget?.toString() || "8",
                        waterReminderInterval: data.dietProfile?.waterReminderInterval?.toString() || "10",
                        waterReminderEnabled: data.dietProfile?.waterReminderEnabled ?? true,
                        calendarPopupMinutes: data.dietProfile?.calendarPopupMinutes?.toString() || "10",
                        calendarEmailMinutes: data.dietProfile?.calendarEmailMinutes?.toString() || "30",
                    });
                    if (data.dietProfile) {
                        setStats(data.dietProfile);
                    }
                    setGoogleConnected(data.googleConnected);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch("/api/user/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                const data = await res.json();
                setStats(data.dietProfile);
                alert("Profile updated successfully!");
            } else {
                alert("Failed to update profile");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred");
        } finally {
            setSaving(false);
        }
    };

    const handleGoogleConnect = () => {
        window.location.href = "/api/auth/google";
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <button onClick={() => router.back()} className={styles.backButton}>
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className={styles.title}>
                        <User size={24} /> Edit Profile
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={styles.input}
                            required
                        />
                    </div>

                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Age</label>
                            <input
                                type="number"
                                value={formData.age}
                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                className={styles.input}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Gender</label>
                            <select
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                className={styles.select}
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Height (cm)</label>
                            <input
                                type="number"
                                value={formData.height}
                                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                                className={styles.input}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Weight (kg)</label>
                            <input
                                type="number"
                                value={formData.weight}
                                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                className={styles.input}
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Target Weight (kg)</label>
                        <input
                            type="number"
                            value={formData.targetWeight}
                            onChange={(e) => setFormData({ ...formData, targetWeight: e.target.value })}
                            className={styles.input}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Activity Level</label>
                        <select
                            value={formData.activityLevel}
                            onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value })}
                            className={styles.select}
                        >
                            <option value="sedentary">Sedentary (Little or no exercise)</option>
                            <option value="light">Light (Exercise 1-3 times/week)</option>
                            <option value="moderate">Moderate (Exercise 4-5 times/week)</option>
                            <option value="active">Active (Daily exercise)</option>
                            <option value="very_active">Very Active (Intense exercise daily)</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Goal</label>
                        <select
                            value={formData.goal}
                            onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                            className={styles.select}
                        >
                            <option value="lose_weight">Lose Weight (-500 kcal)</option>
                            <option value="maintain">Maintain Weight</option>
                            <option value="gain_muscle">Gain Muscle (+300 kcal)</option>
                        </select>
                    </div>

                    {/* Water Intake Settings */}
                    <div className={styles.sectionDivider}>
                        <h3 className={styles.sectionTitle}>
                            <Droplet size={20} /> Water Intake Settings
                        </h3>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Daily Target (glasses)</label>
                            <input
                                type="number"
                                min="1"
                                max="20"
                                value={formData.waterIntakeTarget}
                                onChange={(e) => setFormData({ ...formData, waterIntakeTarget: e.target.value })}
                                className={styles.input}
                            />
                            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                                Recommended: 8 glasses per day
                            </p>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                <input
                                    type="checkbox"
                                    checked={formData.waterReminderEnabled}
                                    onChange={(e) => setFormData({ ...formData, waterReminderEnabled: e.target.checked })}
                                    style={{ marginRight: '0.5rem' }}
                                />
                                Enable Water Reminders
                            </label>
                        </div>

                        {formData.waterReminderEnabled && (
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Reminder Interval (hours)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="24"
                                    value={formData.waterReminderInterval}
                                    onChange={(e) => setFormData({ ...formData, waterReminderInterval: e.target.value })}
                                    className={styles.input}
                                />
                                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                                    You'll be reminded every {formData.waterReminderInterval} hours
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Google Calendar Integration */}
                    <div className={styles.sectionDivider}>
                        <h3 className={styles.sectionTitle}>
                            <Calendar size={20} /> Google Calendar
                        </h3>

                        {searchParams.get("success") === "google_connected" && (
                            <div className={styles.alertSuccess}>
                                <CheckCircle size={18} /> Connected successfully!
                            </div>
                        )}

                        {searchParams.get("error") && (
                            <div className={styles.alertError}>
                                <AlertCircle size={18} /> Failed to connect: {searchParams.get("error")}
                            </div>
                        )}

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Event Reminder (Popup)</label>
                            <input
                                type="number"
                                min="0"
                                max="1440"
                                value={formData.calendarPopupMinutes}
                                onChange={(e) => setFormData({ ...formData, calendarPopupMinutes: e.target.value })}
                                className={styles.input}
                            />
                            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                                Minutes before event (0 to disable)
                            </p>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Event Reminder (Email)</label>
                            <input
                                type="number"
                                min="0"
                                max="1440"
                                value={formData.calendarEmailMinutes}
                                onChange={(e) => setFormData({ ...formData, calendarEmailMinutes: e.target.value })}
                                className={styles.input}
                            />
                            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                                Minutes before event (0 to disable)
                            </p>
                        </div>

                        <div className={styles.googleCard}>
                            <div className={styles.googleInfo}>
                                <div className={styles.googleIcon}>G</div>
                                <div>
                                    <div style={{ fontWeight: "500", color: "#0f172a" }}>Google Calendar</div>
                                    <div className={googleConnected ? styles.statusConnected : styles.statusDisconnected}>
                                        {googleConnected ? "Connected" : "Not connected"}
                                    </div>
                                </div>
                            </div>
                            {googleConnected ? (
                                <button type="button" className={styles.disconnectButton} onClick={() => alert("Disconnect feature coming soon")}>
                                    Disconnect
                                </button>
                            ) : (
                                <button type="button" onClick={handleGoogleConnect} className={styles.connectButton}>
                                    Connect
                                </button>
                            )}
                        </div>
                    </div>

                    <button type="submit" disabled={saving} className={styles.submitButton}>
                        <Save size={20} /> {saving ? "Saving..." : "Save Changes"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>}>
            <ProfileContent />
        </Suspense>
    );
}
