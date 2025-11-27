"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Calendar, Clock, Edit2, Trash2, X, RefreshCw, Share2 } from "lucide-react";
import styles from "./activities.module.css";
import UpgradeModal from "@/components/UpgradeModal";

// ... (existing types)

type Activity = {
    id: string;
    title: string;
    description?: string;
    category: string;
    startTime: string;
    endTime?: string;
    duration?: number;
    synced: boolean;
};

const CATEGORIES = [
    { value: "work", label: "Work", color: "#3b82f6" },
    { value: "personal", label: "Personal", color: "#8b5cf6" },
    { value: "health", label: "Health", color: "#10b981" },
    { value: "fitness", label: "Fitness", color: "#f59e0b" },
    { value: "meal", label: "Meal", color: "#ef4444" },
    { value: "other", label: "Other", color: "#6b7280" },
];

export default function ActivitiesPage() {
    const router = useRouter();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "personal",
        startTime: "",
        endTime: "",
    });

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        try {
            const res = await fetch("/api/activities");
            if (res.ok) {
                const data = await res.json();
                setActivities(data);
            }
        } catch (error) {
            console.error("Failed to fetch activities:", error);
        } finally {
            setLoading(false);
        }
    };

    const [sharingId, setSharingId] = useState<string | null>(null);

    const handleShare = async (activity: Activity) => {
        if (!confirm("Share this activity to the Community Feed?")) return;

        setSharingId(activity.id);
        try {
            const content = `Just finished ${activity.title} (${activity.category})! 🚀\n${activity.description || ""}`;

            const res = await fetch("/api/social/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content }),
            });

            if (res.ok) {
                alert("Shared to feed!");
            } else {
                alert("Failed to share.");
            }
        } catch (error) {
            console.error("Share error:", error);
            alert("An error occurred.");
        } finally {
            setSharingId(null);
        }
    };

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const res = await fetch("/api/activities/sync", { method: "POST" });

            if (res.status === 403) {
                const data = await res.json();
                if (data.error && data.error.includes("Premium")) {
                    setIsUpgradeModalOpen(true);
                } else {
                    alert(data.error);
                }
                return;
            }

            if (res.status === 400 || res.status === 401) {
                // Not connected or expired
                router.push("/api/auth/google"); // Redirect to connect
                return;
            }

            if (res.ok) {
                const data = await res.json();
                alert(data.message);
                fetchActivities(); // Refresh to show synced status if we add UI for it
            } else {
                alert("Failed to sync.");
            }
        } catch (error) {
            console.error("Sync error:", error);
            alert("An error occurred during sync.");
        } finally {
            setIsSyncing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const url = editingId ? `/api/activities/${editingId}` : "/api/activities";
            const method = editingId ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                await fetchActivities();
                resetForm();
            } else {
                const errorData = await res.json();
                alert(`Failed to save: ${errorData.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Failed to save activity:", error);
            alert("An error occurred while saving.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (activity: Activity) => {
        setEditingId(activity.id);
        setFormData({
            title: activity.title,
            description: activity.description || "",
            category: activity.category,
            startTime: activity.startTime.slice(0, 16),
            endTime: activity.endTime ? activity.endTime.slice(0, 16) : "",
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this activity?")) return;

        try {
            const res = await fetch(`/api/activities/${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchActivities();
            }
        } catch (error) {
            console.error("Failed to delete activity:", error);
        }
    };

    const resetForm = () => {
        setFormData({
            title: "",
            description: "",
            category: "personal",
            startTime: "",
            endTime: "",
        });
        setEditingId(null);
        setShowForm(false);
    };

    const getCategoryColor = (category: string) => {
        return CATEGORIES.find(c => c.value === category)?.color || "#6b7280";
    };

    const formatDateTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const groupByDate = (activities: Activity[]) => {
        const grouped: { [key: string]: Activity[] } = {};
        activities.forEach(activity => {
            const date = new Date(activity.startTime).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric",
            });
            if (!grouped[date]) grouped[date] = [];
            grouped[date].push(activity);
        });
        return grouped;
    };

    const groupedActivities = groupByDate(activities);

    return (
        <div className={styles.container}>
            {/* Mobile Header */}
            <header className="md:hidden flex items-center justify-between p-4 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
                <button onClick={() => router.push("/chat")} className="text-white">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-lg font-bold text-white">Activities</h1>
                <div className="w-8" /> {/* Spacer */}
            </header>

            <div className={styles.contentWrapper}>
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <button
                            onClick={() => router.push("/chat")}
                            className={styles.backButton}
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className={styles.title}>Daily Activities</h1>
                            <p className={styles.subtitle}>Track your daily activities and schedule</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className={styles.addButton}
                    >
                        <Plus size={20} />
                        Add Activity
                    </button>
                    <button
                        onClick={handleSync}
                        className={styles.addButton}
                        style={{ marginLeft: "0.5rem", background: "#fff", color: "#3b82f6", border: "1px solid #3b82f6" }}
                        disabled={isSyncing}
                    >
                        <RefreshCw size={20} className={isSyncing ? styles.spin : ""} />
                        {isSyncing ? "Syncing..." : "Sync G-Cal"}
                    </button>
                </div>

                <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />

                {/* Form Modal */}
                {showForm && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContent}>
                            <div className={styles.formHeader}>
                                <h2 className={styles.formTitle}>
                                    {editingId ? "Edit Activity" : "New Activity"}
                                </h2>
                                <button onClick={resetForm} className={styles.closeButton}>
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className={styles.form}>
                                <div>
                                    <label className={styles.label}>Title *</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                        className={styles.input}
                                        placeholder="e.g., Team Meeting"
                                    />
                                </div>

                                <div>
                                    <label className={styles.label}>Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className={styles.textarea}
                                        placeholder="Optional details..."
                                    />
                                </div>

                                <div>
                                    <label className={styles.label}>Category *</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        required
                                        className={styles.select}
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.row}>
                                    <div>
                                        <label className={styles.label}>Start Time *</label>
                                        <input
                                            type="datetime-local"
                                            value={formData.startTime}
                                            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                            required
                                            className={styles.input}
                                        />
                                    </div>
                                    <div>
                                        <label className={styles.label}>End Time</label>
                                        <input
                                            type="datetime-local"
                                            value={formData.endTime}
                                            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                            className={styles.input}
                                        />
                                    </div>
                                </div>

                                <div className={styles.formActions}>
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className={styles.cancelButton}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={styles.submitButton}
                                    >
                                        {isSubmitting ? "Saving..." : (editingId ? "Update" : "Create")}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Activities List */}
                <div className={styles.listContainer}>
                    {loading ? (
                        <p style={{ color: "#94a3b8", textAlign: "center" }}>Loading activities...</p>
                    ) : activities.length === 0 ? (
                        <div className={styles.emptyState}>
                            <Calendar size={48} style={{ color: "#475569", margin: "0 auto 1rem" }} />
                            <p style={{ color: "#94a3b8", fontSize: "1.125rem" }}>No activities yet</p>
                            <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Click "Add Activity" to get started</p>
                        </div>
                    ) : (
                        <div className={styles.activityList}>
                            {Object.entries(groupedActivities).map(([date, dateActivities]) => (
                                <div key={date} className={styles.dateGroup}>
                                    <h3 className={styles.dateHeader}>
                                        {date}
                                    </h3>
                                    <div className={styles.activityList}>
                                        {dateActivities.map((activity) => (
                                            <div
                                                key={activity.id}
                                                className={styles.activityItem}
                                                style={{ borderLeft: `4px solid ${getCategoryColor(activity.category)}` }}
                                            >
                                                <div className={styles.activityContent}>
                                                    <div className={styles.activityHeader}>
                                                        <h4 className={styles.activityTitle}>{activity.title}</h4>
                                                        <span
                                                            className={styles.categoryBadge}
                                                            style={{ background: getCategoryColor(activity.category) }}
                                                        >
                                                            {CATEGORIES.find(c => c.value === activity.category)?.label}
                                                        </span>
                                                    </div>
                                                    {activity.description && (
                                                        <p className={styles.activityDesc}>{activity.description}</p>
                                                    )}
                                                    <div className={styles.activityMeta}>
                                                        <div className={styles.metaItem}>
                                                            <Calendar size={14} />
                                                            {formatDateTime(activity.startTime)}
                                                        </div>
                                                        {activity.duration && (
                                                            <div className={styles.metaItem}>
                                                                <Clock size={14} />
                                                                {activity.duration} min
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className={styles.activityActions}>
                                                    <button
                                                        onClick={() => handleShare(activity)}
                                                        className={styles.actionButton}
                                                        style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}
                                                        disabled={sharingId === activity.id}
                                                    >
                                                        <Share2 size={16} className={sharingId === activity.id ? styles.spin : ""} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(activity)}
                                                        className={styles.actionButton}
                                                        style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(activity.id)}
                                                        className={styles.actionButton}
                                                        style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

