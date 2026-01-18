"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import CurtainReveal from "@/components/ui/curtain-reveal";

const modes = [
    { id: "BOLLYWOOD", name: "Bollywood", tagline: "Masala & Magic", color: "#f97316" },
    { id: "HOLLYWOOD", name: "Hollywood", tagline: "Blockbusters", color: "#3b82f6" },
    { id: "ANIME", name: "Anime", tagline: "Studio Ghibli & More", color: "#a855f7" },
];

function GameLanding() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col relative overflow-hidden">
            {/* Subtle gradient bg */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse at 50% 0%, rgba(30,30,40,0.4) 0%, transparent 60%)",
                }}
            />

            <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">

                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-14"
                >
                    {/* Film reel icon */}
                    <motion.div
                        className="inline-flex items-center justify-center w-14 h-14 mb-5 rounded-full border border-neutral-800/80 bg-neutral-900/50"
                        style={{
                            boxShadow: "0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
                        }}
                        whileHover={{ scale: 1.05, rotate: 10 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <span className="text-xl">🎞️</span>
                    </motion.div>

                    <h1
                        className="font-display text-4xl md:text-5xl font-bold text-white tracking-tight mb-2"
                        style={{
                            textShadow: "0 4px 20px rgba(0,0,0,0.5)",
                        }}
                    >
                        CineGuess
                    </h1>
                    <p className="text-neutral-500 text-sm">
                        Blur. Hint. Guess. Repeat.
                    </p>
                </motion.div>

                {/* Screenings */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="w-full max-w-sm mb-10"
                >
                    <p className="text-neutral-600 text-[10px] uppercase tracking-[0.2em] text-center mb-4">
                        Now Showing
                    </p>

                    <div className="space-y-2.5">
                        {modes.map((mode, index) => (
                            <motion.div
                                key={mode.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + index * 0.08 }}
                            >
                                <Link
                                    href={`/play/${mode.id}`}
                                    className="group flex items-center justify-between w-full px-5 py-4 rounded-xl bg-neutral-900/60 border border-neutral-800/60 hover:border-neutral-700 hover:bg-neutral-800/60 transition-all duration-200"
                                    style={{
                                        boxShadow: "0 2px 10px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.02)",
                                    }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-1 h-8 rounded-full"
                                            style={{
                                                backgroundColor: mode.color,
                                                boxShadow: `0 0 12px ${mode.color}40`,
                                            }}
                                        />
                                        <div>
                                            <span className="block text-white font-medium text-[15px]">
                                                {mode.name}
                                            </span>
                                            <span className="block text-neutral-500 text-xs">
                                                {mode.tagline}
                                            </span>
                                        </div>
                                    </div>
                                    <span
                                        className="text-neutral-600 group-hover:text-neutral-400 group-hover:translate-x-0.5 transition-all"
                                    >
                                        →
                                    </span>
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
                    className="w-full max-w-sm mb-10"
                >
                    <Link
                        href="/daily"
                        className="group relative flex items-center justify-between w-full px-5 py-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 hover:border-amber-400/50 hover:from-amber-500/15 hover:to-orange-500/15 transition-all duration-200"
                        style={{
                            boxShadow: "0 2px 15px rgba(251, 191, 36, 0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
                        }}
                    >
                        {/* Pulse effect */}
                        <motion.div
                            animate={{
                                scale: [1, 1.05, 1],
                                opacity: [0.3, 0.5, 0.3],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10"
                        />

                        <div className="relative flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                                <span className="text-xl">📅</span>
                            </div>
                            <div>
                                <span className="block text-amber-200 font-medium text-[15px]">
                                    Daily Challenge
                                </span>
                                <span className="block text-amber-400/60 text-xs">
                                    New movie every day!
                                </span>
                            </div>
                        </div>
                        <span className="relative text-amber-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all">
                            →
                        </span>
                    </Link>
                </motion.div>

                {/* How to play pill */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-center"
                >
                    <div
                        className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-neutral-800/60 bg-neutral-900/40"
                        style={{
                            boxShadow: "0 2px 10px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.02)",
                        }}
                    >
                        <span className="text-neutral-500 text-xs">🎬 See blur</span>
                        <span className="w-0.5 h-3 rounded-full bg-neutral-700/50" />
                        <span className="text-neutral-500 text-xs">💡 Get hints</span>
                        <span className="w-0.5 h-3 rounded-full bg-neutral-700/50" />
                        <span className="text-neutral-500 text-xs">🏆 Score</span>
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
