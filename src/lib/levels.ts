export interface LevelInfo {
    level: number;
    title: string;
    icon: string;
    minXp: number;
    maxXp: number;
    nextLevelXp: number;
    progress: number; // 0-100
}

const LEVEL_TIERS = [
    { level: 1, title: "Beginner", icon: "🌱", minXp: 0, maxXp: 99 },
    { level: 2, title: "Committed", icon: "💪", minXp: 100, maxXp: 299 },
    { level: 3, title: "Disciplined", icon: "🎯", minXp: 300, maxXp: 599 },
    { level: 4, title: "Dedicated", icon: "⭐", minXp: 600, maxXp: 999 },
    { level: 5, title: "Expert", icon: "🏆", minXp: 1000, maxXp: 1499 },
    { level: 6, title: "Master", icon: "👑", minXp: 1500, maxXp: 2099 },
    { level: 7, title: "Champion", icon: "🔥", minXp: 2100, maxXp: Infinity },
];

export function getLevelInfo(xp: number): LevelInfo {
    // Find current level tier
    const currentTier = LEVEL_TIERS.find(tier => xp >= tier.minXp && xp <= tier.maxXp) || LEVEL_TIERS[0];

    // Calculate next level XP
    const nextLevelXp = currentTier.maxXp === Infinity ? currentTier.minXp : currentTier.maxXp + 1;

    // Calculate progress to next level (0-100)
    const xpInCurrentLevel = xp - currentTier.minXp;
    const xpNeededForNextLevel = nextLevelXp - currentTier.minXp;
    const progress = currentTier.maxXp === Infinity
        ? 100
        : Math.min(100, Math.floor((xpInCurrentLevel / xpNeededForNextLevel) * 100));

    return {
        level: currentTier.level,
        title: currentTier.title,
        icon: currentTier.icon,
        minXp: currentTier.minXp,
        maxXp: currentTier.maxXp,
        nextLevelXp: nextLevelXp,
        progress: progress
    };
}

export function getXpToNextLevel(xp: number): number {
    const levelInfo = getLevelInfo(xp);
    if (levelInfo.maxXp === Infinity) {
        return 0; // Max level reached
    }
    return levelInfo.nextLevelXp - xp;
}
