"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { CinematicBackground } from "@/components/ui/cinematic-background";
import { CalendarDays, Clock, Film, Clapperboard, Sparkles, Check, ArrowLeft, ArrowRight, Flame } from "lucide-react";

const categories = [
    { id: "BOLLYWOOD", name: "Bollywood", Icon: Film, color: "#f97316", tagline: "Masala & Magic" },
    { id: "HOLLYWOOD", name: "Hollywood", Icon: Clapperboard, color: "#3b82f6", tagline: "Blockbusters" },
    { id: "ANIME", name: "Anime", Icon: Sparkles, color: "#a855f7", tagline: "Studio Ghibli & More" },
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

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-radial-gradient from-white/5 to-transparent opacity-20" />
                <div className="text-center relative z-10">
                    <div className="animate-spin mb-4">
                        <Clock className="w-8 h-8 text-neutral-500 mx-auto" />
                    </div>
                    <p className="text-neutral-500 text-xs uppercase tracking-widest">Loading challenges...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col relative overflow-hidden">
            {/* Ambient Background */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: "radial-gradient(circle at 50% -20%, rgba(251, 191, 36, 0.1), rgba(255,255,255,0.05) 40%, transparent 80%)",
                    filter: "blur(60px)",
                }}
            />

            <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative z-10">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <Link href="/" className="group inline-flex items-center gap-2 text-neutral-500 hover:text-white transition-colors text-xs uppercase tracking-widest mb-8">
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to Menu
                    </Link>

                    <div className="relative mx-auto mb-6 w-16 h-16">
                        <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl animate-pulse" />
                        <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 flex items-center justify-center shadow-2xl">
                            <CalendarDays className="w-8 h-8 text-amber-500" strokeWidth={1.5} />
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white via-white/90 to-white/50 mb-3 tracking-tight">
                        Daily Challenge
                    </h1>
                    <p className="text-neutral-400 max-w-md mx-auto">
                        One movie per category. One chance.
                        <br />
                        <span className="text-amber-500/80 font-medium">Reset in {countdown}</span>
                    </p>
                </motion.div>

                {/* Category Cards */}
                <div className="w-full max-w-md space-y-4">
                    {categories.map((cat, index) => {
                        const challenge = dailyChallenges[cat.id];
                        const played = playedToday[cat.id];
                        const CategoryIcon = cat.Icon;

                        return (
                            <motion.div
                                key={cat.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 + index * 0.1 }}
                            >
                                <Link
                                    href={played ? '#' : `/daily/${cat.id}`}
                                    className={`
                                        group relative flex items-center justify-between w-full p-4 rounded-xl
                                        border transition-all duration-300 overflow-hidden
                                        ${played
                                            ? 'bg-neutral-900/30 border-white/5 opacity-60 cursor-default'
                                            : 'bg-neutral-900/60 border-white/10 hover:border-white/20 hover:bg-white/5'
                                        }
                                    `}
                                    onClick={(e) => played && e.preventDefault()}
                                >
                                    {/* Hosting Glow */}
                                    {!played && (
                                        <div
                                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                            style={{ background: `radial-gradient(circle at center, ${cat.color}15, transparent 70%)` }}
                                        />
                                    )}

                                    <div className="flex items-center gap-4 relative z-10">
                                        <div
                                            className="w-12 h-12 rounded-lg flex items-center justify-center border"
                                            style={{
                                                background: `${cat.color}10`,
                                                borderColor: `${cat.color}30`,
                                                color: cat.color
                                            }}
                                        >
                                            <CategoryIcon className="w-6 h-6" strokeWidth={1.5} />
                                        </div>

                                        <div className="text-left">
                                            <h3 className={`text-lg font-medium transition-colors ${played ? 'text-neutral-500' : 'text-neutral-200 group-hover:text-white'}`}>
                                                {cat.name}
                                            </h3>
                                            <p className="text-neutral-500 text-xs">
                                                {played
                                                    ? 'Challenge completed'
                                                    : 'Ready to play'
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    {/* Status Indicator */}
                                    <div className="relative z-10">
                                        {played ? (
                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                                                <Check className="w-3.5 h-3.5" />
                                                <span className="text-xs font-medium">Done</span>
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                                <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-white" />
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Footer Streak */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-12 text-center"
                >
                    <div className="inline-flex items-center gap-2 text-neutral-500 text-xs uppercase tracking-widest">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span>Build your streak daily</span>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
