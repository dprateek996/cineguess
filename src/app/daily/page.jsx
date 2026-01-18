"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { AnimatedGradient } from "@/components/ui/animated-gradient";
import FilmReelSpinner from "@/components/ui/film-reel-spinner";

const categories = [
    { id: "BOLLYWOOD", name: "Bollywood", icon: "🎭", color: "#f97316", tagline: "Masala & Magic" },
    { id: "HOLLYWOOD", name: "Hollywood", icon: "🎬", color: "#3b82f6", tagline: "Blockbusters" },
    { id: "ANIME", name: "Anime", icon: "⛩️", color: "#a855f7", tagline: "Studio Ghibli & More" },
];

export default function DailyChallengePage() {
    const [dailyChallenges, setDailyChallenges] = useState({});
    const [loading, setLoading] = useState(true);
    const [countdown, setCountdown] = useState("");
    const [playedToday, setPlayedToday] = useState({});

    // Fetch daily challenges for each category
    useEffect(() => {
        const fetchDailyChallenges = async () => {
            try {
                const challenges = {};
                for (const cat of categories) {
                    const res = await fetch(`/api/daily?industry=${cat.id}`);
                    const data = await res.json();
                    if (data.success) {
                        challenges[cat.id] = data.data;
                    }
                }
                setDailyChallenges(challenges);
            } catch (error) {
                console.error("Error fetching daily challenges:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDailyChallenges();

        // Check localStorage for played today
        const today = new Date().toISOString().split('T')[0];
        const played = {};
        categories.forEach(cat => {
            const key = `cineguess_daily_${cat.id}_${today}`;
            played[cat.id] = localStorage.getItem(key) === 'true';
        });
        setPlayedToday(played);
    }, []);

    // Countdown to midnight UTC
    useEffect(() => {
        const updateCountdown = () => {
            const now = new Date();
            const midnight = new Date();
            midnight.setUTCHours(24, 0, 0, 0);
            const diff = midnight - now;

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setCountdown(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, []);

    // Show spinner while loading
    if (loading) {
        return (
            <AnimatedGradient className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <FilmReelSpinner size="lg" industry="HOLLYWOOD" className="mx-auto mb-4" />
                    <p className="text-neutral-500 text-sm">Loading today's challenges...</p>
                </div>
            </AnimatedGradient>
        );
    }

    return (
        <AnimatedGradient className="min-h-screen">
            <div className="max-w-2xl mx-auto px-4 py-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <Link href="/" className="text-neutral-500 hover:text-white transition-colors text-sm mb-4 inline-block">
                        ← Back to Menu
                    </Link>

                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="text-6xl mb-4"
                    >
                        📅
                    </motion.div>

                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        Daily Challenge
                    </h1>
                    <p className="text-neutral-400">
                        One movie per category. One chance. Prove your skills!
                    </p>
                </motion.div>

                {/* Countdown */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mb-10"
                >
                    <p className="text-neutral-500 text-xs uppercase tracking-widest mb-2">
                        Next challenge in
                    </p>
                    <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass border border-neutral-700/50">
                        <span className="text-xl">⏱️</span>
                        <span className="text-2xl font-mono font-bold text-white tracking-wider">
                            {countdown}
                        </span>
                    </div>
                </motion.div>

                {/* Category Cards */}
                <div className="space-y-4">
                    {categories.map((cat, index) => {
                        const challenge = dailyChallenges[cat.id];
                        const played = playedToday[cat.id];

                        return (
                            <motion.div
                                key={cat.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + index * 0.1 }}
                            >
                                <Link
                                    href={played ? '#' : `/daily/${cat.id}`}
                                    className={`
                                        group flex items-center justify-between w-full p-5 rounded-2xl 
                                        glass border border-neutral-700/50 
                                        ${played
                                            ? 'opacity-60 cursor-default'
                                            : 'hover:border-neutral-600 hover:bg-neutral-800/50'
                                        }
                                        transition-all duration-200
                                    `}
                                    onClick={(e) => played && e.preventDefault()}
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Icon */}
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                                            style={{
                                                background: `linear-gradient(135deg, ${cat.color}20, ${cat.color}10)`,
                                                border: `1px solid ${cat.color}30`,
                                            }}
                                        >
                                            {cat.icon}
                                        </div>

                                        {/* Info */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">
                                                {cat.name}
                                            </h3>
                                            <p className="text-neutral-500 text-sm">
                                                {cat.tagline}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div className="flex items-center gap-3">
                                        {challenge && (
                                            <div className="text-right">
                                                <p className="text-neutral-400 text-xs">Today's stats</p>
                                                <p className="text-neutral-300 text-sm">
                                                    {challenge.totalWins}/{challenge.totalAttempts} won
                                                </p>
                                            </div>
                                        )}

                                        {played ? (
                                            <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                                                ✓ Completed
                                            </span>
                                        ) : (
                                            <motion.span
                                                animate={{ x: [0, 4, 0] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                                className="text-neutral-600 group-hover:text-neutral-400 transition-colors"
                                            >
                                                →
                                            </motion.span>
                                        )}
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Streak Info */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-10 text-center"
                >
                    <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full glass border border-neutral-800">
                        <span className="text-orange-400">🔥</span>
                        <span className="text-neutral-500 text-sm">
                            Keep playing daily to build your streak!
                        </span>
                    </div>
                </motion.div>
            </div>
        </AnimatedGradient>
    );
}
