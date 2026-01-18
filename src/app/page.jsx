"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import CurtainReveal from "@/components/ui/curtain-reveal";
import { Film, Calendar, Eye, Lightbulb, Trophy, ArrowRight } from "lucide-react";

const modes = [
    { id: "BOLLYWOOD", name: "Bollywood", tagline: "Masala & Magic", color: "#f97316" },
    { id: "HOLLYWOOD", name: "Hollywood", tagline: "Blockbusters", color: "#3b82f6" },
    { id: "ANIME", name: "Anime", tagline: "Studio Ghibli & More", color: "#a855f7" },
];

function GameLanding() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col relative overflow-hidden">
            {/* Ambient Spotlight (Top Center - Softer) */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: "radial-gradient(circle at 50% -20%, rgba(120,119,198,0.15), rgba(255,255,255,0.05) 40%, transparent 80%)",
                    filter: "blur(60px)",
                }}
            />

            <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">

                {/* Logo & Title Refined */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center mb-16 relative"
                >
                    {/* Glowing Logo */}
                    <div className="relative inline-block mb-6 group">
                        <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl group-hover:bg-blue-500/30 transition-all duration-500" />
                        <motion.div
                            className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl"
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <Film className="w-8 h-8 text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]" strokeWidth={1.5} />
                        </motion.div>
                    </div>

                    <h1
                        className="font-display text-5xl md:text-7xl font-bold tracking-tighter mb-4"
                    >
                        <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white/90 to-white/50">
                            CineGuess
                        </span>
                    </h1>
                    <p className="text-neutral-400 text-sm md:text-base font-light tracking-wide max-w-md mx-auto">
                        The ultimate frame-by-frame movie trivia experience
                    </p>
                </motion.div>

                {/* Screenings */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="w-full max-w-sm mb-10"
                >
                    <p className="text-neutral-700 text-[10px] uppercase tracking-[0.25em] text-center mb-6 font-bold">
                        Select Cinema
                    </p>

                    <div className="space-y-3">
                        {modes.map((mode, index) => (
                            <motion.div
                                key={mode.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + index * 0.08 }}
                            >
                                <Link
                                    href={`/play/${mode.id}`}
                                    className="group flex items-center justify-between w-full px-5 py-4 rounded-xl bg-neutral-900/40 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all duration-300"
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-1.5 h-1.5 rounded-full"
                                            style={{
                                                backgroundColor: mode.color,
                                                boxShadow: `0 0 10px ${mode.color}`,
                                            }}
                                        />
                                        <div className="text-left">
                                            <span className="block text-neutral-200 font-medium text-[15px] group-hover:text-white transition-colors">
                                                {mode.name}
                                            </span>
                                            <span className="block text-neutral-600 text-xs group-hover:text-neutral-500 transition-colors">
                                                {mode.tagline}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300 text-neutral-400">
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Daily Challenge Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="w-full max-w-sm mb-12"
                >
                    <Link
                        href="/daily"
                        className="group relative flex items-center justify-between w-full p-1 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 hover:from-amber-500/20 hover:to-orange-500/20 transition-all duration-500"
                    >
                        <div className="w-full flex items-center justify-between px-5 py-4 rounded-xl bg-[#0a0a0a] border border-amber-500/20 group-hover:border-amber-500/30 transition-all">
                            <div className="relative flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-amber-900/20 border border-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <Calendar className="w-5 h-5 text-amber-500" strokeWidth={1.5} />
                                </div>
                                <div className="text-left">
                                    <span className="block text-amber-100 font-medium text-[15px]">
                                        Daily Challenge
                                    </span>
                                    <span className="block text-amber-500/60 text-xs">
                                        New movie every 24h
                                    </span>
                                </div>
                            </div>
                            <Trophy className="w-4 h-4 text-amber-500/40 group-hover:text-amber-500 transition-colors" />
                        </div>
                    </Link>
                </motion.div>

                {/* How to play pill - Refined */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-center"
                >
                    <div
                        className="inline-flex items-center gap-6 px-6 py-3 rounded-full border border-white/5 bg-white/5 backdrop-blur-sm"
                    >
                        <div className="flex flex-col items-center gap-1 group">
                            <div className="p-1.5 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                                <Eye className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-colors" />
                            </div>
                            <span className="text-[10px] text-neutral-500 font-medium uppercase tracking-wider">Observe</span>
                        </div>

                        <div className="w-px h-6 bg-white/5" />

                        <div className="flex flex-col items-center gap-1 group">
                            <div className="p-1.5 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                                <Lightbulb className="w-3.5 h-3.5 text-neutral-400 group-hover:text-yellow-400 transition-colors" />
                            </div>
                            <span className="text-[10px] text-neutral-500 font-medium uppercase tracking-wider">Hint</span>
                        </div>

                        <div className="w-px h-6 bg-white/5" />

                        <div className="flex flex-col items-center gap-1 group">
                            <div className="p-1.5 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                                <Trophy className="w-3.5 h-3.5 text-neutral-400 group-hover:text-amber-400 transition-colors" />
                            </div>
                            <span className="text-[10px] text-neutral-500 font-medium uppercase tracking-wider">Win</span>
                        </div>
                    </div>
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="py-5 text-center border-t border-neutral-800/30 relative z-10">
                <p className="text-neutral-700 text-xs">
                    A movie guessing experience
                </p>
            </footer>
        </div>
    );
}

export default function Home() {
    return (
        <CurtainReveal>
            <GameLanding />
        </CurtainReveal>
    );
}
