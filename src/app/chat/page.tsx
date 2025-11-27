"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Send, Camera, Mic, LogOut, Trash2, User, Droplet, Plus, Minus, Activity, BarChart2, Calendar, Menu, Zap, X, ClipboardList, Users } from "lucide-react";
import styles from "./chat.module.css";
import "./hud.css";
import UpgradeModal from "@/components/UpgradeModal";
import Sidebar from "@/components/Sidebar";
import { FREE_MESSAGE_LIMIT } from "@/lib/subscription";
import { getLevelInfo } from "@/lib/levels";

type Quest = {
    type: "EXERCISE" | "FOOD" | "WATER";
    title: string;
    description: string;
    xp: number;
    action?: {
        type: "LOG_EXERCISE" | "LOG_FOOD" | "LOG_WATER";
        data: any;
    };
};

type Message = {
    id: string;
    text: string;
    sender: "user" | "bot";
    timestamp: Date;
    quest?: Quest;
};



type FoodLog = {
    id: string;
    foodName: string;
    calories: number;
    portion: string;
    protein: number;
    carbs: number;
    fat: number;
    mealType: string;
    loggedAt: string;
};

type ExerciseLog = {
    id: string;
    exerciseName: string;
    duration: number;
    caloriesBurned: number;
    loggedAt: string;
};

export default function Chat() {
    const router = useRouter();
    const [userName, setUserName] = useState("User");
    const [messages, setMessages] = useState<Message[]>([]);
    const [mounted, setMounted] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);

    // Subscription State
    const [isPremium, setIsPremium] = useState(false);
    const [messageCount, setMessageCount] = useState(0);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    const [input, setInput] = useState("");
    const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
    const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
    const [availableFoods, setAvailableFoods] = useState<any[]>([]);
    const [dailyStats, setDailyStats] = useState({
        caloriesConsumed: 0,
        caloriesBurned: 0,
        targetCalories: 2000,
        protein: 0,
        carbs: 0,
        fat: 0
    });
    const [waterIntake, setWaterIntake] = useState(0);
    const [waterIntakeTarget, setWaterIntakeTarget] = useState(8);
    const [xp, setXp] = useState(0);
    const [completedQuests, setCompletedQuests] = useState<Set<string>>(new Set());

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    useEffect(() => {
        setMounted(true);

        const initChat = async () => {
            const userData = await fetchUserData();
            const logs = await fetchFoodLogs();
            fetchWaterIntake();
            fetchExerciseLogs();
            fetchAvailableFoods();

            if (messages.length === 0) {
                const greeting = getGreeting(userData?.name || "User", logs || []);
                setMessages([{
                    id: "1",
                    text: greeting,
                    sender: "bot",
                    timestamp: new Date()
                }]);
            }
        };

        initChat();

        // Scroll to bottom after initial load
        setTimeout(() => scrollToBottom("auto"), 100);
        setTimeout(() => scrollToBottom("auto"), 500);
    }, []);

    const getGreeting = (name: string, logs: FoodLog[]) => {
        const hour = new Date().getHours();
        const hasBreakfast = logs.some(l => l.mealType === 'breakfast');
        const hasLunch = logs.some(l => l.mealType === 'lunch');
        const hasDinner = logs.some(l => l.mealType === 'dinner');

        if (hour >= 5 && hour < 11) {
            return hasBreakfast
                ? `Selamat pagi ${name}! Wah sudah sarapan ya. Jangan lupa minum air putih yang cukup hari ini!`
                : `Selamat pagi ${name}! Sudah siap untuk memulai hari? Mau sarapan apa pagi ini?`;
        } else if (hour >= 11 && hour < 15) {
            return hasLunch
                ? `Selamat siang ${name}! Energi sudah terisi kembali. Semangat lanjut aktivitas!`
                : `Selamat siang ${name}! Waktunya makan siang nih. Mau rekomendasi menu makan siang yang sehat?`;
        } else if (hour >= 15 && hour < 18) {
            return `Selamat sore ${name}! ${logs.some(l => l.mealType === 'snack') ? "Asik nih abis ngemil. Tetap jaga kalori ya!" : "Lagi butuh camilan sore atau mau langsung siap-siap makan malam?"}`;
        } else {
            return hasDinner
                ? `Selamat malam ${name}! Hari yang produktif. Jangan lupa istirahat yang cukup ya.`
                : `Selamat malam ${name}! Sudah makan malam belum? Yuk catat makan malammu.`;
        }
    };

    useEffect(() => {
        scrollToBottom("smooth");
    }, [messages]);

    // Calculate XP based on daily activities
    useEffect(() => {
        // XP from food logs: 1 XP per 10 calories logged
        const foodXp = foodLogs.reduce((acc, log) => acc + Math.floor(log.calories / 10), 0);

        // XP from exercise: 1 XP per calorie burned
        const exerciseXp = exerciseLogs.reduce((acc, log) => acc + log.caloriesBurned, 0);

        // XP from water: 5 XP per glass
        const waterXp = waterIntake * 5;

        const totalXp = foodXp + exerciseXp + waterXp;
        setXp(totalXp);
    }, [foodLogs, exerciseLogs, waterIntake]);

    useEffect(() => {
        calculateStats(foodLogs, exerciseLogs);
    }, [foodLogs, exerciseLogs]);

    const fetchUserData = async () => {
        try {
            const res = await fetch("/api/auth/me");
            if (!res.ok) {
                console.error("Failed to fetch user data:", res.status, res.statusText);
                return;
            }
            const data = await res.json();
            if (data.name) {
                setUserName(data.name);

                // Subscription Data
                const isPrem = data.subscriptionTier === "PREMIUM" &&
                    (!data.subscriptionExpiresAt || new Date(data.subscriptionExpiresAt) > new Date());
                setIsPremium(isPrem);
                setMessageCount(data.messageCount || 0);

                if (data.dietProfile?.dailyCalories) {
                    setDailyStats(prev => ({ ...prev, targetCalories: data.dietProfile.dailyCalories }));
                }
                if (data.dietProfile?.waterIntakeTarget) {
                    setWaterIntakeTarget(data.dietProfile.waterIntakeTarget);
                }
                return data;
            }
        } catch (error) {
            console.error("Failed to fetch user data", error);
        }
        return null;
    };

    const fetchAvailableFoods = async () => {
        try {
            const res = await fetch("/api/foods/search");
            if (res.ok) {
                const data = await res.json();
                setAvailableFoods(data);
            }
        } catch (error) {
            console.error("Failed to fetch foods", error);
        }
    };

    const fetchFoodLogs = async () => {
        try {
            const res = await fetch("/api/food-logs");
            if (res.ok) {
                const logs = await res.json();
                setFoodLogs(logs);
                return logs;
            }
        } catch (error) {
            console.error("Failed to fetch food logs", error);
        }
        return [];
    };

    const fetchExerciseLogs = async () => {
        try {
            const res = await fetch("/api/exercises");
            if (res.ok) {
                const logs = await res.json();
                setExerciseLogs(logs);
            }
        } catch (error) {
            console.error("Failed to fetch exercise logs", error);
        }
    };

    const fetchWaterIntake = async () => {
        try {
            console.log("Fetching water intake...");
            const res = await fetch("/api/water-intake");
            if (res.ok) {
                const data = await res.json();
                console.log("Water intake data received:", data);
                setWaterIntake(data.totalGlasses);
                console.log("Water intake state updated to:", data.totalGlasses);
            } else {
                console.error("Failed to fetch water intake. Status:", res.status);
            }
        } catch (error) {
            console.error("Failed to fetch water intake", error);
        }
    };

    const calculateStats = (foods: FoodLog[], exercises: ExerciseLog[]) => {
        const foodStats = foods.reduce((acc: any, log: any) => ({
            calories: acc.calories + log.calories,
            protein: acc.protein + (log.protein || 0),
            carbs: acc.carbs + (log.carbs || 0),
            fat: acc.fat + (log.fat || 0),
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

        const burned = exercises.reduce((acc, log) => acc + log.caloriesBurned, 0);

        setDailyStats(prev => ({
            ...prev,
            caloriesConsumed: foodStats.calories,
            caloriesBurned: burned,
            protein: foodStats.protein,
            carbs: foodStats.carbs,
            fat: foodStats.fat
        }));
    };

    const updateWaterIntake = async (amount: number) => {
        // Optimistic update
        const newAmount = Math.max(0, waterIntake + amount);
        setWaterIntake(newAmount);

        try {
            console.log("Updating water intake, amount:", amount);
            const res = await fetch("/api/water-intake", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ glasses: amount }),
            });

            if (res.ok) {
                console.log("Water intake updated successfully");
            } else {
                const errorData = await res.json().catch(() => ({}));
                console.error("Failed to update water. Status:", res.status, "Error:", errorData);
            }

            // Re-fetch to ensure sync
            fetchWaterIntake();
        } catch (error) {
            console.error("Failed to update water", error);
            fetchWaterIntake(); // Revert on error
        }
    };

    const getMealType = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 11) return "breakfast";
        if (hour >= 11 && hour < 15) return "lunch";
        if (hour >= 15 && hour < 22) return "dinner";
        return "snack";
    };

    const saveFoodLog = async (food: { name?: string; foodName?: string; calories: number; portion: string; protein?: number; carbs?: number; fat?: number }) => {
        try {
            const actualFoodName = food.foodName || food.name;
            if (!actualFoodName) {
                console.error("Food name is missing:", food);
                return;
            }

            console.log("Saving food log:", food);
            const res = await fetch("/api/food-logs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    foodName: actualFoodName,
                    calories: food.calories,
                    portion: food.portion,
                    protein: food.protein || 0,
                    carbs: food.carbs || 0,
                    fat: food.fat || 0,
                    mealType: getMealType(),
                }),
            });

            if (res.ok) {
                console.log("Food log saved successfully");
                fetchFoodLogs();
            } else {
                const errorData = await res.json().catch(() => ({}));
                console.error("Failed to save food log. Status:", res.status, "Error:", errorData);
            }
        } catch (error) {
            console.error("Failed to save food log", error);
        }
    };

    const saveExerciseLog = async (exercise: { name?: string; exerciseName?: string; duration: number; calories?: number; caloriesBurned?: number }) => {
        try {
            const actualExerciseName = exercise.exerciseName || exercise.name;
            if (!actualExerciseName) {
                console.error("Exercise name is missing:", exercise);
                return;
            }

            const actualCalories = exercise.caloriesBurned || exercise.calories || 0;

            const res = await fetch("/api/exercises", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    exerciseName: actualExerciseName,
                    duration: exercise.duration,
                    caloriesBurned: actualCalories,
                    notes: "Logged via chat"
                }),
            });

            if (res.ok) {
                fetchExerciseLogs();
            }
        } catch (error) {
            console.error("Failed to save exercise log", error);
        }
    };

    const deleteFoodLog = async (id: string) => {
        try {
            const res = await fetch(`/api/food-logs/${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchFoodLogs();
            }
        } catch (error) {
            console.error("Failed to delete log", error);
        }
    };

    const deleteExerciseLog = async (id: string) => {
        try {
            const res = await fetch(`/api/exercises/${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchExerciseLogs();
            }
        } catch (error) {
            console.error("Failed to delete exercise log", error);
        }
    };



    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/login");
            router.refresh();
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    // --- SMART CHAT ---
    const getSmartAdvice = async (query: string) => {
        setIsAnalyzing(true);
        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: query }),
            });

            if (res.status === 403) {
                const data = await res.json();
                if (data.isLimitReached) {
                    setIsUpgradeModalOpen(true);
                    throw new Error(data.error);
                }
            }

            if (res.ok) {
                const data = await res.json();
                const botMsg: Message = {
                    id: Date.now().toString(),
                    text: data.reply,
                    sender: "bot",
                    timestamp: new Date(),
                    quest: data.quest // Store quest data
                };
                setMessages((prev) => [...prev, botMsg]);
                if (!isPremium) setMessageCount(prev => prev + 1);
            } else {
                const errorData = await res.json().catch(() => ({}));
                console.error("API Error Details:", errorData);
                throw new Error(errorData.error || "Failed to get advice");
            }
        } catch (error) {
            console.error("Smart chat error:", error);
            const errorMsg: Message = {
                id: Date.now().toString(),
                text: "Maaf, saya sedang tidak bisa berpikir jernih. Coba lagi nanti ya! 😵‍💫",
                sender: "bot",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleCompleteQuest = (quest: Quest, messageId: string) => {
        // Check if already completed
        if (completedQuests.has(messageId)) {
            return;
        }

        if (quest.action && quest.action.data) {
            if (quest.action.type === "LOG_EXERCISE") {
                // Validate exercise data
                const exerciseData = quest.action.data;
                if (exerciseData.exerciseName || exerciseData.name) {
                    saveExerciseLog(exerciseData);
                } else {
                    console.error("Quest exercise data is incomplete:", exerciseData);
                    alert("Quest data tidak lengkap. Silakan log exercise secara manual.");
                    return;
                }
            } else if (quest.action.type === "LOG_FOOD") {
                // Validate food data
                const foodData = quest.action.data;
                if (foodData.foodName || foodData.name) {
                    saveFoodLog(foodData);
                } else {
                    console.error("Quest food data is incomplete:", foodData);
                    alert("Quest data tidak lengkap. Silakan log makanan secara manual.");
                    return;
                }
            }
        }

        // Mark quest as completed
        setCompletedQuests(prev => new Set(prev).add(messageId));

        // Visual feedback
        alert(`Quest Complete! +${quest.xp} XP`);
    };

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: input,
            sender: "user",
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        const userInput = input.toLowerCase();
        setInput("");

        // --- EXERCISE DETECTION ---
        const exerciseKeywords = ["lari", "jogging", "jalan", "sepeda", "gym", "renang", "push up", "sit up"];
        const isExercise = exerciseKeywords.some(keyword => userInput.includes(keyword));

        if (isExercise) {
            let duration = 30; // Default
            const durationMatch = userInput.match(/(\d+)\s*(menit|jam)/);
            if (durationMatch) {
                duration = parseInt(durationMatch[1]);
                if (durationMatch[2] === "jam") duration *= 60;
            }

            let calories = 0;
            if (userInput.includes("lari") || userInput.includes("jogging")) calories = duration * 10;
            else if (userInput.includes("jalan")) calories = duration * 4;
            else if (userInput.includes("sepeda")) calories = duration * 6;
            else if (userInput.includes("gym")) calories = duration * 5;
            else if (userInput.includes("renang")) calories = duration * 8;
            else calories = duration * 5;

            setTimeout(() => {
                const botMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    text: `Wah, hebat! Kamu sudah ${userInput.includes("lari") ? "lari" : "olahraga"} selama ${duration} menit. 🔥\nKalori terbakar: ${calories} kkal.`,
                    sender: "bot",
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, botMsg]);

                saveExerciseLog({
                    name: userInput.split(" ").slice(0, 2).join(" "), // Simple name extraction
                    duration: duration,
                    calories: calories
                });
            }, 500);
            return;
        }

        // --- FOOD LOGGING (Hardcoded Patterns) ---
        if (userInput.includes("nasi goreng")) {
            setTimeout(() => {
                const botMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    text: "Oke, Nasi Goreng (300 kkal) sudah dicatat! 🍛",
                    sender: "bot",
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, botMsg]);
                saveFoodLog({ name: "Nasi Goreng", calories: 300, portion: "1 piring" });
            }, 500);
        } else if (userInput.includes("ayam goreng")) {
            setTimeout(() => {
                const botMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    text: "Siap, Ayam Goreng (260 kkal) masuk log! 🍗",
                    sender: "bot",
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, botMsg]);
                saveFoodLog({ name: "Ayam Goreng", calories: 260, portion: "1 potong" });
            }, 500);
        } else if (userInput.includes("telur")) {
            setTimeout(() => {
                const botMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    text: "Telur (70 kkal) dicatat. Protein boost! 🥚",
                    sender: "bot",
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, botMsg]);
                saveFoodLog({ name: "Telur", calories: 70, portion: "1 butir", protein: 6 });
            }, 500);
        } else if (userInput.includes("kopi")) {
            setTimeout(() => {
                const botMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    text: "Kopi (10 kkal) dicatat. Semangat! ☕",
                    sender: "bot",
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, botMsg]);
                saveFoodLog({ name: "Kopi", calories: 10, portion: "1 cangkir" });
            }, 500);
        } else {
            // --- FALLBACK: SMART CHAT ---
            getSmartAdvice(input);
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!isPremium) {
            setIsUpgradeModalOpen(true);
            // Reset input
            if (event.target) event.target.value = "";
            return;
        }

        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Please upload an image file");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("Image size must be less than 5MB");
            return;
        }

        setIsAnalyzing(true);

        const userMsg: Message = {
            id: Date.now().toString(),
            text: "📷 [Uploaded food image]",
            sender: "user",
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMsg]);

        const analyzingMsg: Message = {
            id: (Date.now() + 1).toString(),
            text: "🤖 Analyzing your food image...",
            sender: "bot",
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, analyzingMsg]);

        const formData = new FormData();
        formData.append("image", file);

        try {
            const res = await fetch("/api/analyze-food", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Analysis failed");

            const data = await res.json();
            setIsAnalyzing(false);

            const resultMsg: Message = {
                id: (Date.now() + 2).toString(),
                text: data.analysis,
                sender: "bot",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, resultMsg]);

            if (data.foods) {
                data.foods.forEach((food: any) => saveFoodLog(food));
                fetchFoodLogs();
            }

        } catch (error) {
            console.error("Error analyzing food:", error);
            setIsAnalyzing(false);
            const errorMsg: Message = {
                id: (Date.now() + 3).toString(),
                text: "Maaf, saya mengalami kesulitan menganalisis gambar tersebut. Silakan coba lagi atau input manual.",
                sender: "bot",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMsg]);
        }
    };

    if (!mounted) return null;

    const netCalories = dailyStats.caloriesConsumed - dailyStats.caloriesBurned;
    const remainingCalories = dailyStats.targetCalories - netCalories;

    // Calculate color for calorie bar
    const getCalorieBarColor = () => {
        const percentage = (remainingCalories / dailyStats.targetCalories) * 100;
        if (percentage > 50) return "safe"; // Green
        if (percentage > 20) return "warning"; // Yellow
        return "danger"; // Red
    };

    return (
        <div className={styles.container}>
            <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />

            {/* Overlay */}
            <div
                className={`${styles.overlay} ${isSidebarOpen ? styles.overlayVisible : ''}`}
                onClick={() => setIsSidebarOpen(false)}
            />

            {/* Sidebar */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onLogout={handleLogout}
                stats={{
                    caloriesConsumed: dailyStats.caloriesConsumed,
                    caloriesBurned: dailyStats.caloriesBurned,
                    targetCalories: dailyStats.targetCalories,
                    waterIntake: waterIntake,
                    waterIntakeTarget: waterIntakeTarget,
                    xp: xp,
                    level: getLevelInfo(xp).level,
                    levelTitle: getLevelInfo(xp).title,
                    levelIcon: getLevelInfo(xp).icon
                }}
                onAddWater={updateWaterIntake}
                onOpenLog={() => setIsLogModalOpen(true)}
            />

            {/* Main Chat Area */}
            <main className={styles.main}>
                <header className={styles.header}>
                    <div className={styles.headerContent}>
                        <button
                            className={styles.menuButton}
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                        <div className={styles.statusDot}></div>
                        <span className={styles.logoText}>Diet Coach AI</span>
                    </div>
                    <button
                        className={styles.logoutButton}
                        onClick={handleLogout}
                    >
                        <LogOut size={20} />
                    </button>
                </header>

                {/* Feature Shortcuts */}
                <div className={styles.shortcutsContainer}>
                    <button onClick={() => router.push('/social')} className={styles.shortcutButton}>
                        <div className={styles.shortcutIcon} style={{ color: '#10b981' }}>
                            <Users size={20} />
                        </div>
                        <span className={styles.shortcutLabel}>Community</span>
                    </button>
                    <button onClick={() => router.push('/activities')} className={styles.shortcutButton}>
                        <div className={styles.shortcutIcon} style={{ color: '#3b82f6' }}>
                            <Calendar size={20} />
                        </div>
                        <span className={styles.shortcutLabel}>Activities</span>
                    </button>
                    <button onClick={() => router.push('/analytics')} className={styles.shortcutButton}>
                        <div className={styles.shortcutIcon} style={{ color: '#8b5cf6' }}>
                            <BarChart2 size={20} />
                        </div>
                        <span className={styles.shortcutLabel}>Analytics</span>
                    </button>
                </div>

                <div className={styles.chatArea}>
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`${styles.message} ${msg.sender === "user" ? styles.userMessage : styles.botMessage}`}
                        >
                            <div style={{ whiteSpace: "pre-wrap" }}>{msg.text}</div>

                            {/* Quest Card */}
                            {msg.quest && (
                                <div className="quest-card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                        <div>
                                            <h4 style={{ color: '#10b981', margin: 0, fontSize: '0.9rem' }}>{msg.quest.title}</h4>
                                            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>{msg.quest.description}</p>
                                        </div>
                                        <div className="xp-badge" style={{ fontSize: '0.7rem' }}>+{msg.quest.xp} XP</div>
                                    </div>
                                    <button
                                        onClick={() => handleCompleteQuest(msg.quest!, msg.id)}
                                        disabled={completedQuests.has(msg.id)}
                                        className="glass-button"
                                        style={{
                                            width: '100%',
                                            padding: '8px',
                                            fontSize: '0.85rem',
                                            borderRadius: '8px',
                                            opacity: completedQuests.has(msg.id) ? 0.5 : 1,
                                            cursor: completedQuests.has(msg.id) ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        {completedQuests.has(msg.id) ? '✓ Completed' : 'Complete Quest'}
                                    </button>
                                </div>
                            )}
                            <div style={{ fontSize: "0.7rem", opacity: 0.7, marginTop: "0.5rem", textAlign: "right" }}>
                                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', padding: '0 1rem 0.5rem', overflowX: 'auto', scrollbarWidth: 'none' }}>
                    <button
                        onClick={() => {
                            const msg = "Saran makanan rendah kalori yang mengenyangkan?";
                            setMessages(prev => [...prev, { id: Date.now().toString(), text: msg, sender: "user", timestamp: new Date() }]);
                            getSmartAdvice(msg);
                        }}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '999px',
                            border: '1px solid #e2e8f0',
                            background: 'white',
                            fontSize: '0.85rem',
                            color: '#475569',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            flexShrink: 0
                        }}
                    >
                        🥗 Saran Makanan
                    </button>
                    <button
                        onClick={() => {
                            const msg = "Saran olahraga untuk membakar kalori ekstra?";
                            setMessages(prev => [...prev, { id: Date.now().toString(), text: msg, sender: "user", timestamp: new Date() }]);
                            getSmartAdvice(msg);
                        }}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '999px',
                            border: '1px solid #e2e8f0',
                            background: 'white',
                            fontSize: '0.85rem',
                            color: '#475569',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            flexShrink: 0
                        }}
                    >
                        🏃 Saran Olahraga
                    </button>
                    <button
                        onClick={() => {
                            const msg = "Saya makan berlebihan hari ini, apa recovery plan-nya?";
                            setMessages(prev => [...prev, { id: Date.now().toString(), text: msg, sender: "user", timestamp: new Date() }]);
                            getSmartAdvice(msg);
                        }}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '999px',
                            border: '1px solid #e2e8f0',
                            background: 'white',
                            fontSize: '0.85rem',
                            color: '#475569',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            flexShrink: 0
                        }}
                    >
                        🩹 Recovery Plan
                    </button>
                </div>

                <div className={styles.inputArea}>
                    <button className={styles.iconButton} onClick={() => fileInputRef.current?.click()}>
                        <Camera size={24} />
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        style={{ display: "none" }}
                        accept="image/*"
                    />
                    {/* <button className={styles.iconButton}>
                        <Mic size={24} />
                    </button> */}
                    <input
                        type="text"
                        className={styles.input}
                        placeholder={isAnalyzing ? "Analyzing image..." : "Type a message..."}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        disabled={isAnalyzing}
                    />
                    <button className={styles.sendButton} onClick={handleSend} disabled={isAnalyzing}>
                        <Send size={20} />
                    </button>
                </div>
            </main>

            {/* Daily Log Modal */}
            {
                isLogModalOpen && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 100,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(4px)'
                    }}>
                        <div style={{
                            background: 'white',
                            padding: '1.5rem',
                            borderRadius: '1rem',
                            width: '90%',
                            maxWidth: '500px',
                            maxHeight: '80vh',
                            overflowY: 'auto',
                            position: 'relative',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                        }}>
                            <button
                                onClick={() => setIsLogModalOpen(false)}
                                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                            >
                                <X size={24} />
                            </button>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <ClipboardList size={24} />
                                Today's Log
                            </h3>

                            {foodLogs.length === 0 && exerciseLogs.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                                    <ClipboardList size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                                    <p>No activity logged yet today.</p>
                                    <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Try logging your meals or exercise!</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {/* Grouped Food Logs */}
                                    {['breakfast', 'lunch', 'dinner', 'snack'].map((mealType) => {
                                        const logs = foodLogs.filter(l => l.mealType === mealType);
                                        if (logs.length === 0) return null;
                                        return (
                                            <div key={mealType}>
                                                <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#64748b', textTransform: 'capitalize', marginBottom: '0.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.25rem' }}>{mealType}</h4>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                    {logs.map((log) => (
                                                        <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                                                            <div>
                                                                <div style={{ fontWeight: '600', color: '#334155' }}>{log.foodName}</div>
                                                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{log.calories} kcal • {log.protein}g P • {log.carbs}g C • {log.fat}g F</div>
                                                            </div>
                                                            <button
                                                                onClick={() => deleteFoodLog(log.id)}
                                                                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', padding: '0.5rem', borderRadius: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Exercise Logs */}
                                    {exerciseLogs.length > 0 && (
                                        <div>
                                            <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#64748b', marginBottom: '0.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.25rem' }}>Exercise</h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                {exerciseLogs.map((log) => (
                                                    <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f0fdf4', borderRadius: '0.5rem', border: '1px solid #bbf7d0' }}>
                                                        <div>
                                                            <div style={{ fontWeight: '600', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                <Activity size={16} /> {log.exerciseName}
                                                            </div>
                                                            <div style={{ fontSize: '0.8rem', color: '#15803d' }}>{log.caloriesBurned} kcal burned • {log.duration} mins</div>
                                                        </div>
                                                        <button
                                                            onClick={() => deleteExerciseLog(log.id)}
                                                            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#dc2626', padding: '0.5rem', borderRadius: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )
            }
        </div >
    );
}
