"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FilmGrain } from "@/components/ui/film-grain";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Icons } from "@/components/Icons";
import { CalendarDays, Clock, Check, ArrowLeft, ArrowRight, Flame } from "lucide-react";

const categories = [
    { id: "BOLLYWOOD", name: "Bollywood", Icon: Icons.Bollywood, color: "#f97316", tagline: "Masala & Magic" },
    { id: "HOLLYWOOD", name: "Hollywood", Icon: Icons.Hollywood, color: "#3b82f6", tagline: "Blockbusters" },
];

export default function DailyChallengePage() {
    const [dailyChallenges, setDailyChallenges] = useState({});
    const [loading, setLoading] = useState(true);
    const [countdown, setCountdown] = useState("");
    const [playedToday, setPlayedToday] = useState({});

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

        const today = new Date().toISOString().split('T')[0];
        const played = {};
        categories.forEach(cat => {
            const key = `cinequest_daily_${cat.id}_${today}`;
            played[cat.id] = localStorage.getItem(key) === 'true';
        });
        setPlayedToday(played);
    }, []);

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

    // Ambient Background Wrapper
    const AmbientBackground = () => (
        <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--gradient-center)_0%,_transparent_65%)] opacity-30 blur-3xl [--gradient-center:theme(colors.primary.DEFAULT/10)]" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background/0 to-transparent blur-3xl opacity-50" />
            <FilmGrain />
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
                <AmbientBackground />
                <div className="text-center relative z-10 p-8 rounded-3xl bg-zinc-900/50 backdrop-blur-md border border-white/5">
                    <div className="animate-spin mb-4 inline-block">
                        <Clock className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold">Loading challenges...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col relative overflow-hidden selection:bg-primary/20">
            <AmbientBackground />

            <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative z-10 w-full max-w-lg mx-auto">

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12 w-full"
                >
                    <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors text-xs uppercase tracking-widest mb-10 font-bold">
                        <ArrowLeft className="w-3 h-3" /> Back to Menu
                    </Link>

                    <div className="relative mx-auto mb-6 w-16 h-16">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                        <div className="relative w-full h-full rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center shadow-2xl">
                            <Icons.Projector className="w-8 h-8 text-primary" />
                        </div>
                    </div>

                    <h1 className="text-5xl font-extrabold text-white mb-3 tracking-tighter">
                        Daily Challenge
                    </h1>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                        One movie per category. One chance.<br />
                        <span className="text-primary font-bold">{countdown}</span> until reset.
                    </p>
                </motion.div>

                <div className="w-full space-y-3">
                    {categories.map((cat, index) => {
                        const played = playedToday[cat.id];
                        const CategoryIcon = cat.Icon;

                        if (played) {
                            return (
                                <motion.div
                                    key={cat.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="w-full px-5 py-4 rounded-2xl border border-white/5 bg-zinc-900/30 flex items-center justify-between opacity-60 grayscale cursor-not-allowed">
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            <div className="p-2.5 rounded-xl bg-white/5">
                                                <CategoryIcon className="w-5 h-5 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-muted-foreground">{cat.name}</h3>
                                                <p className="text-xs text-muted-foreground/60">Challenge Completed</p>
                                            </div>
                                        </div>
                                        <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                    </div>
                                </motion.div>
                            )
                        }

                        return (
                            <motion.div
                                key={cat.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Link href={`/daily/${cat.id}`}>
                                    <SpotlightCard className="w-full group cursor-pointer transition-transform active:scale-[0.98]">
                                        <div className="flex items-center justify-between w-full px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 rounded-xl bg-zinc-900 border border-white/10 group-hover:border-primary/50 transition-colors">
                                                    <CategoryIcon className="w-5 h-5 text-white group-hover:text-primary transition-colors" />
                                                </div>
                                                <div className="text-left">
                                                    <h3 className="font-semibold text-white group-hover:text-primary transition-colors">{cat.name}</h3>
                                                    <p className="text-xs text-muted-foreground">{cat.tagline}</p>
                                                </div>
                                            </div>
                                            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </SpotlightCard>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-12 text-center"
                >
                    <div className="inline-flex items-center gap-2 text-muted-foreground/50 text-[10px] uppercase tracking-[0.2em] font-bold">
                        <Flame className="w-3 h-3 text-orange-500" />
                        <span>Build your streak daily</span>
                    </div>
                </motion.div>

            </main>
        </div>
    );
}
