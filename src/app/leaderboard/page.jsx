"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Icons } from "@/components/Icons";
import { FilmGrain } from "@/components/ui/film-grain";
import { Trophy, Crown, Medal, ArrowLeft, Flame, Zap, Globe } from "lucide-react";

const CATEGORIES = [
    { key: "GLOBAL", label: "Global", icon: Globe, color: "#a855f7" }, // Purple
    { key: "BOLLYWOOD", label: "Bollywood", icon: Icons.Bollywood, color: "#f97316" },
    { key: "HOLLYWOOD", label: "Hollywood", icon: Icons.Hollywood, color: "#3b82f6" },
    { key: "RAPIDFIRE", label: "Rapid Fire", icon: Zap, color: "#ef4444" },
];

const RAPIDFIRE_SUBCATEGORIES = [
    { key: "RAPIDFIRE_BOLLYWOOD", label: "Bollywood", icon: Icons.Bollywood },
    { key: "RAPIDFIRE_HOLLYWOOD", label: "Hollywood", icon: Icons.Hollywood },
];

function getRankBadge(rank) {
    if (rank === 1) return { icon: Crown, color: "#fbbf24", bg: "from-amber-500/20 to-yellow-500/10" };
    if (rank === 2) return { icon: Medal, color: "#94a3b8", bg: "from-slate-400/20 to-slate-500/10" };
    if (rank === 3) return { icon: Medal, color: "#cd7f32", bg: "from-orange-600/20 to-amber-700/10" };
    return null;
}

export default function LeaderboardPage() {
    const [activeCategory, setActiveCategory] = useState("BOLLYWOOD");
    const [rapidfireSubcategory, setRapidfireSubcategory] = useState("RAPIDFIRE_BOLLYWOOD");
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const effectiveCategory = activeCategory === "RAPIDFIRE" ? rapidfireSubcategory : activeCategory;

    useEffect(() => {
        async function fetchLeaderboard() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/leaderboard?category=${effectiveCategory}&limit=50`);
                const data = await res.json();
                if (data.success) {
                    setLeaderboard(data.data);
                } else {
                    setError(data.error || "Failed to load leaderboard");
                }
            } catch (err) {
                setError("Failed to load leaderboard");
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchLeaderboard();
    }, [effectiveCategory]);

    const activeCategoryConfig = CATEGORIES.find(c => c.key === activeCategory);

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div
                    className="absolute inset-0 opacity-30 blur-3xl"
                    style={{
                        background: `radial-gradient(circle at center, ${activeCategoryConfig?.color}20 0%, transparent 65%)`
                    }}
                />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background/0 to-transparent blur-3xl opacity-50" />
            </div>
            <FilmGrain />

            <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all active:scale-95 mb-6 group"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="uppercase tracking-widest text-[10px] font-bold">Back to Menu</span>
                    </Link>

                    <div className="flex items-center justify-center gap-3 mb-3">
                        <Trophy className="w-8 h-8 text-primary" />
                        <h1 className="text-4xl font-extrabold tracking-tight text-white">Leaderboard</h1>
                    </div>
                    <p className="text-muted-foreground text-sm uppercase tracking-widest">Top Cinephiles</p>
                </motion.div>

                {/* Category Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex justify-center gap-2 mb-6"
                >
                    {CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const isActive = activeCategory === cat.key;
                        return (
                            <button
                                key={cat.key}
                                onClick={() => setActiveCategory(cat.key)}
                                className={`
                                    relative px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-300
                                    ${isActive
                                        ? "bg-white/10 text-white ring-1 ring-white/20"
                                        : "text-muted-foreground hover:text-white hover:bg-white/5"
                                    }
                                `}
                            >
                                <Icon className="w-4 h-4" style={{ color: isActive ? cat.color : undefined }} />
                                <span className="text-xs font-semibold uppercase tracking-wider">{cat.label}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 rounded-xl ring-2 -z-10"
                                        style={{ ringColor: cat.color + "40" }}
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </motion.div>

                {/* Rapid Fire Subcategory Tabs */}
                <AnimatePresence>
                    {activeCategory === "RAPIDFIRE" && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex justify-center gap-2 mb-6"
                        >
                            {RAPIDFIRE_SUBCATEGORIES.map((sub) => {
                                const Icon = sub.icon;
                                const isActive = rapidfireSubcategory === sub.key;
                                return (
                                    <button
                                        key={sub.key}
                                        onClick={() => setRapidfireSubcategory(sub.key)}
                                        className={`
                                            px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all duration-200
                                            ${isActive
                                                ? "bg-red-500/20 text-red-400 ring-1 ring-red-500/30"
                                                : "text-muted-foreground hover:text-white hover:bg-white/5"
                                            }
                                        `}
                                    >
                                        <Icon className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-semibold uppercase tracking-wider">{sub.label}</span>
                                    </button>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Leaderboard List */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden"
                >
                    {/* Table Header */}
                    <div className="grid grid-cols-[60px_1fr_100px] gap-4 px-5 py-3 border-b border-white/5 text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                        <span>Rank</span>
                        <span>Player</span>
                        <span className="text-right">Score</span>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="py-16 text-center">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                className="inline-block"
                            >
                                <Flame className="w-8 h-8 text-primary" />
                            </motion.div>
                            <p className="text-muted-foreground text-sm mt-3">Loading rankings...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="py-16 text-center">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && leaderboard.length === 0 && (
                        <div className="py-16 text-center">
                            <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                            <p className="text-muted-foreground text-sm">No scores yet. Be the first!</p>
                        </div>
                    )}

                    {/* Leaderboard Entries */}
                    {!loading && !error && leaderboard.length > 0 && (
                        <div className="divide-y divide-white/5">
                            {leaderboard.map((entry, index) => {
                                const rank = entry.rank || index + 1;
                                const badge = getRankBadge(rank);
                                const BadgeIcon = badge?.icon;

                                return (
                                    <motion.div
                                        key={entry.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        className={`
                                            grid grid-cols-[60px_1fr_100px] gap-4 px-5 py-4 items-center
                                            transition-colors hover:bg-white/[0.02]
                                            ${rank <= 3 ? `bg-gradient-to-r ${badge?.bg}` : ""}
                                        `}
                                    >
                                        {/* Rank */}
                                        <div className="flex items-center gap-2">
                                            {badge && BadgeIcon ? (
                                                <div
                                                    className="w-8 h-8 rounded-full flex items-center justify-center"
                                                    style={{ backgroundColor: badge.color + "20" }}
                                                >
                                                    <BadgeIcon className="w-4 h-4" style={{ color: badge.color }} />
                                                </div>
                                            ) : (
                                                <span className="text-lg font-bold text-muted-foreground w-8 text-center">
                                                    {rank}
                                                </span>
                                            )}
                                        </div>

                                        {/* Username */}
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span
                                                className={`
                                                    font-semibold truncate
                                                    ${rank <= 3 ? "text-white" : "text-white/80"}
                                                `}
                                            >
                                                @{entry.username}
                                            </span>
                                            {entry.moviesGuessed > 0 && (
                                                <span className="text-[10px] text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full whitespace-nowrap">
                                                    {entry.moviesGuessed} movies
                                                </span>
                                            )}
                                        </div>

                                        {/* Score */}
                                        <div className="text-right">
                                            <span
                                                className={`
                                                    font-bold tabular-nums
                                                    ${rank === 1 ? "text-xl text-amber-400" :
                                                        rank <= 3 ? "text-lg text-white" :
                                                            "text-white/60"}
                                                `}
                                            >
                                                {entry.highScore.toLocaleString()}
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>

                {/* Play CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-8 text-center"
                >
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-opacity"
                    >
                        <Icons.Play className="w-3 h-3 fill-current" />
                        Play Now
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
