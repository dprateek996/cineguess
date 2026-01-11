"use client";
import { useEffect, useState, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/hooks/useGame";
import { AnimatedGradient } from "@/components/ui/animated-gradient";
import Link from "next/link";

const industryConfig = {
    BOLLYWOOD: {
        name: "Bollywood",
        gradient: "from-orange-500 to-yellow-500",
        glow: "rgba(249, 115, 22, 0.3)",
        icon: "🎭",
    },
    HOLLYWOOD: {
        name: "Hollywood",
        gradient: "from-blue-600 to-cyan-400",
        glow: "rgba(37, 99, 235, 0.3)",
        icon: "🎬",
    },
    ANIME: {
        name: "Anime",
        gradient: "from-purple-600 to-pink-500",
        glow: "rgba(147, 51, 234, 0.3)",
        icon: "⛩️",
    },
    GLOBAL: {
        name: "Global",
        gradient: "from-emerald-500 to-teal-400",
        glow: "rgba(16, 185, 129, 0.3)",
        icon: "🌍",
    },
};

export default function PlayPage({ params }) {
    const { industry } = use(params);
    const { session, loading, error, result, initGame, submitGuess, resetGame } = useGame();
    const [guess, setGuess] = useState("");
    const [shakeInput, setShakeInput] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    const config = industryConfig[industry] || industryConfig.HOLLYWOOD;

    useEffect(() => {
        initGame(industry);
    }, [industry, initGame]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!guess.trim() || loading) return;

        try {
            const res = await submitGuess(guess.trim());
            setGuess("");

            if (res.status === "WRONG") {
                setShakeInput(true);
                setTimeout(() => setShakeInput(false), 500);
            } else if (res.isCorrect) {
                setShowConfetti(true);
                // Trigger confetti
                import("canvas-confetti").then((confetti) => {
                    confetti.default({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 },
                    });
                });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const getBlurAmount = () => {
        if (!session) return 45;
        const level = session.currentLevel || 1;
        return Math.max(0, 45 - (level - 1) * 12);
    };

    if (loading && !session) {
        return (
            <AnimatedGradient className="min-h-screen flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <div className="text-5xl mb-4 animate-bounce">{config.icon}</div>
                    <p className="text-neutral-400">Loading {config.name} challenge...</p>
                </motion.div>
            </AnimatedGradient>
        );
    }

    if (error && !session) {
        return (
            <AnimatedGradient className="min-h-screen flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center glass rounded-2xl p-8 max-w-md"
                >
                    <div className="text-5xl mb-4">😢</div>
                    <h2 className="text-xl font-bold text-white mb-2">Oops!</h2>
                    <p className="text-neutral-400 mb-6">{error}</p>
                    <Link href="/" className="btn-primary">
                        Go Back
                    </Link>
                </motion.div>
            </AnimatedGradient>
        );
    }

    // Game Over Screen
    if (session?.isGameOver) {
        return (
            <AnimatedGradient className="min-h-screen flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center glass rounded-3xl p-10 max-w-lg w-full"
                    style={{ boxShadow: `0 0 100px ${config.glow}` }}
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="text-7xl mb-6"
                    >
                        {session.isWon ? "🎉" : "😔"}
                    </motion.div>

                    <h2 className={`text-3xl font-bold mb-4 bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>
                        {session.isWon ? "You Got It!" : "Game Over"}
                    </h2>

                    {session.isWon && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mb-6"
                        >
                            <p className="text-neutral-400 mb-2">Your Score</p>
                            <p className="text-5xl font-bold text-white">{session.score}</p>
                        </motion.div>
                    )}

                    {!session.isWon && session.correctAnswer && (
                        <p className="text-neutral-400 mb-6">
                            The answer was: <span className="text-white font-semibold">{session.correctAnswer}</span>
                        </p>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                        <button
                            onClick={() => {
                                resetGame();
                                initGame(industry);
                            }}
                            className="btn-primary"
                        >
                            Play Again
                        </button>
                        <Link href="/" className="btn-secondary">
                            Change Mode
                        </Link>
                    </div>
                </motion.div>
            </AnimatedGradient>
        );
    }

    return (
        <AnimatedGradient className="min-h-screen">
            <div className="max-w-4xl mx-auto px-4 py-8 md:py-16">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-8"
                >
                    <Link href="/" className="text-neutral-400 hover:text-white transition-colors">
                        ← Back
                    </Link>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${config.gradient} bg-opacity-20`}>
                        <span>{config.icon}</span>
                        <span className="font-medium text-white">{config.name}</span>
                    </div>
                </motion.div>

                {/* Hint Level Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex justify-center gap-3 mb-8"
                >
                    {[1, 2, 3, 4].map((level) => (
                        <div
                            key={level}
                            className={`hint-dot ${level < (session?.currentLevel || 1)
                                    ? "active"
                                    : level === (session?.currentLevel || 1)
                                        ? "current"
                                        : ""
                                }`}
                        />
                    ))}
                </motion.div>

                {/* Blurred Poster Area */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="relative aspect-video rounded-2xl overflow-hidden mb-8 glass"
                    style={{ boxShadow: `0 0 60px ${config.glow}` }}
                >
                    {/* Placeholder gradient background */}
                    <div
                        className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-30`}
                        style={{ filter: `blur(${getBlurAmount()}px)` }}
                    />

                    {/* Center content */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                            key={getBlurAmount()}
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            className="text-8xl"
                            style={{ filter: `blur(${getBlurAmount() / 10}px)` }}
                        >
                            🎬
                        </motion.div>
                    </div>

                    {/* Level indicator */}
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/50 text-sm text-white">
                        Level {session?.currentLevel || 1}/4
                    </div>
                </motion.div>

                {/* Current Hint */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={session?.hint}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="glass rounded-xl p-6 mb-8 text-center"
                    >
                        <p className="text-sm text-neutral-400 mb-2">Hint</p>
                        <p className="text-lg md:text-xl text-white font-medium">
                            {session?.hint || "Loading..."}
                        </p>
                    </motion.div>
                </AnimatePresence>

                {/* Result Feedback */}
                <AnimatePresence>
                    {result && !result.isCorrect && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`text-center mb-4 p-3 rounded-lg ${result.status === "NEAR_MISS"
                                    ? "bg-yellow-500/20 text-yellow-400"
                                    : "bg-red-500/20 text-red-400"
                                }`}
                        >
                            {result.message}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Guess Input */}
                <motion.form
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row gap-4"
                >
                    <input
                        type="text"
                        value={guess}
                        onChange={(e) => setGuess(e.target.value)}
                        placeholder="Enter movie name..."
                        className={`input-game flex-1 ${shakeInput ? "animate-shake" : ""}`}
                        disabled={loading}
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={loading || !guess.trim()}
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "..." : "Guess"}
                    </button>
                </motion.form>

                {/* Attempts */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center text-neutral-500 mt-6 text-sm"
                >
                    Attempts: {session?.attempts || 0}
                </motion.p>
            </div>
        </AnimatedGradient>
    );
}
