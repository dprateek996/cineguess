"use client";
import { useEffect, useState, use, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSound } from "@/hooks/useSound";
import { AnimatedGradient } from "@/components/ui/animated-gradient";
import GameIntro from "@/components/ui/game-intro";
import SceneImage from "@/components/ui/scene-image";
import TypewriterDialogue from "@/components/ui/typewriter-dialogue";
import EmojiClue from "@/components/ui/emoji-clue";
import StageTransition from "@/components/ui/stage-transition";
import FilmStripProgress from "@/components/ui/film-strip-progress";
import SoundToggle from "@/components/ui/sound-toggle";
import AutocompleteInput from "@/components/ui/autocomplete-input";
import ShareCard from "@/components/ui/share-card";
import CategoryBackground from "@/components/ui/category-background";
import Link from "next/link";

const industryConfig = {
    BOLLYWOOD: {
        name: "Bollywood",
        gradient: "from-orange-500 to-yellow-500",
        glow: "rgba(249, 115, 22, 0.3)",
        icon: "🎭",
        confettiColors: ["#f97316", "#fbbf24", "#ef4444", "#ec4899"],
    },
    HOLLYWOOD: {
        name: "Hollywood",
        gradient: "from-blue-600 to-cyan-400",
        glow: "rgba(37, 99, 235, 0.3)",
        icon: "🎬",
        confettiColors: ["#3b82f6", "#06b6d4", "#8b5cf6", "#fbbf24"],
    },
    ANIME: {
        name: "Anime",
        gradient: "from-purple-600 to-pink-500",
        glow: "rgba(147, 51, 234, 0.3)",
        icon: "⛩️",
        confettiColors: ["#a855f7", "#ec4899", "#f472b6", "#c084fc"],
    },
};

export default function DailyGamePage({ params }) {
    const { industry } = use(params);
    const { isMuted, toggleMute, playCorrect, playWrong, playTransition, playGameOver } = useSound();

    const [showIntro, setShowIntro] = useState(true);
    const [loading, setLoading] = useState(true);
    const [dailyData, setDailyData] = useState(null);
    const [currentStage, setCurrentStage] = useState(1);
    const [guess, setGuess] = useState("");
    const [shakeInput, setShakeInput] = useState(false);
    const [result, setResult] = useState(null);
    const [gameOver, setGameOver] = useState(false);
    const [won, setWon] = useState(false);
    const [showShareCard, setShowShareCard] = useState(false);
    const [alreadyPlayed, setAlreadyPlayed] = useState(false);

    const config = industryConfig[industry] || industryConfig.HOLLYWOOD;

    // Check if already played today
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const key = `cineguess_daily_${industry}_${today}`;
        if (localStorage.getItem(key) === 'true') {
            setAlreadyPlayed(true);
        }
    }, [industry]);

    // Fetch daily challenge data
    useEffect(() => {
        const fetchDaily = async () => {
            try {
                const res = await fetch(`/api/daily?industry=${industry}`);
                const data = await res.json();
                if (data.success && data.data) {
                    setDailyData(data.data);
                }
            } catch (error) {
                console.error("Error fetching daily:", error);
            } finally {
                setLoading(false);
            }
        };

        if (!showIntro) {
            fetchDaily();
        }
    }, [industry, showIntro]);

    const markAsPlayed = useCallback((didWin) => {
        const today = new Date().toISOString().split('T')[0];
        const key = `cineguess_daily_${industry}_${today}`;
        localStorage.setItem(key, 'true');

        // Save result for stats
        const statsKey = `cineguess_daily_stats_${industry}`;
        const stats = JSON.parse(localStorage.getItem(statsKey) || '{"played":0,"won":0,"streak":0}');
        stats.played++;
        if (didWin) {
            stats.won++;
            stats.streak++;
        } else {
            stats.streak = 0;
        }
        localStorage.setItem(statsKey, JSON.stringify(stats));
    }, [industry]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!guess.trim() || !dailyData) return;

        try {
            const res = await fetch('/api/daily', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    industry,
                    guess: guess.trim(),
                    stage: currentStage,
                }),
            });
            const data = await res.json();
            setGuess("");

            if (data.isCorrect) {
                playCorrect();
                setWon(true);
                setGameOver(true);
                markAsPlayed(true);

                // Confetti
                import("canvas-confetti").then((confetti) => {
                    confetti.default({
                        particleCount: 200,
                        spread: 100,
                        origin: { y: 0.6 },
                        colors: config.confettiColors,
                    });
                });
            } else {
                playWrong();
                setShakeInput(true);
                setTimeout(() => setShakeInput(false), 500);
                setResult({ message: data.message || "Wrong guess!" });

                if (currentStage < 4) {
                    playTransition();
                    setCurrentStage(prev => prev + 1);
                    setResult(null);
                } else {
                    // Game over - out of stages
                    playGameOver();
                    setGameOver(true);
                    markAsPlayed(false);
                }
            }
        } catch (error) {
            console.error("Submit error:", error);
        }
    };

    // Get stage content from daily data
    const getStageContent = () => {
        if (!dailyData?.movie?.hints) return null;
        const hints = dailyData.movie.hints;
        const movie = dailyData.movie;

        switch (currentStage) {
            case 1:
                return <SceneImage backdropPath={movie.backdropPath} alt="Movie Scene" />;
            case 2:
                return <TypewriterDialogue dialogue={hints.level2Dialogue} typingSpeed={40} />;
            case 3:
                return <EmojiClue emojis={hints.level3Emoji} />;
            case 4:
                return (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative aspect-[2/3] max-w-sm mx-auto rounded-2xl overflow-hidden glass"
                        style={{ boxShadow: `0 0 60px ${config.glow}` }}
                    >
                        {movie.posterPath && (
                            <motion.img
                                src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
                                alt="Movie Poster"
                                className="absolute inset-0 w-full h-full object-cover"
                                style={{ filter: `blur(${hints.level1Blur || 25}px)`, transform: 'scale(1.15)' }}
                            />
                        )}
                        <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm">
                            <span className="text-sm">🖼️</span>
                            <span className="text-xs text-neutral-300 uppercase tracking-wider">Blurred Poster</span>
                        </div>
                    </motion.div>
                );
            default:
                return null;
        }
    };

    // Intro screen
    if (showIntro) {
        return <GameIntro onComplete={() => setShowIntro(false)} industry={industry} />;
    }

    // Already played today
    if (alreadyPlayed) {
        return (
            <AnimatedGradient className="min-h-screen flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center glass rounded-3xl p-10 max-w-lg"
                >
                    <div className="text-6xl mb-6">✅</div>
                    <h2 className="text-2xl font-bold text-white mb-3">
                        Already Played Today!
                    </h2>
                    <p className="text-neutral-400 mb-6">
                        Come back tomorrow for a new {config.name} daily challenge.
                    </p>
                    <Link href="/daily" className="btn-primary inline-block">
                        ← Back to Daily
                    </Link>
                </motion.div>
            </AnimatedGradient>
        );
    }

    // Loading state
    if (loading) {
        return (
            <AnimatedGradient className="min-h-screen flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <div className="text-5xl mb-4 animate-bounce">{config.icon}</div>
                    <p className="text-neutral-400">Loading daily challenge...</p>
                </motion.div>
            </AnimatedGradient>
        );
    }

    // No daily challenge available
    if (!dailyData) {
        return (
            <AnimatedGradient className="min-h-screen flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center glass rounded-2xl p-8 max-w-md"
                >
                    <div className="text-5xl mb-4">😢</div>
                    <h2 className="text-xl font-bold text-white mb-2">No Challenge Today</h2>
                    <p className="text-neutral-400 mb-6">The daily challenge for {config.name} isn't available yet.</p>
                    <Link href="/daily" className="btn-primary inline-block">Back to Daily</Link>
                </motion.div>
            </AnimatedGradient>
        );
    }

    // Game Over
    if (gameOver) {
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
                        {won ? "🏆" : "💔"}
                    </motion.div>

                    <h2 className={`text-3xl font-bold mb-2 bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>
                        {won ? "You Got It!" : "Better Luck Tomorrow!"}
                    </h2>

                    <p className="text-neutral-400 mb-2">
                        📅 Daily {config.name} Challenge
                    </p>

                    <div className="glass rounded-xl p-4 mb-6">
                        <p className="text-neutral-400 text-sm">The movie was:</p>
                        <p className="text-2xl font-bold text-white">{dailyData.movie?.title}</p>
                    </div>

                    <div className="flex items-center justify-center gap-2 mb-6">
                        <span className="text-neutral-500 text-sm">Solved in</span>
                        <span className="text-amber-400 font-bold">Stage {currentStage}</span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={() => setShowShareCard(true)}
                            className="btn-secondary flex items-center justify-center gap-2"
                        >
                            📤 Share
                        </button>
                        <Link href="/daily" className="btn-primary">
                            ← Back to Daily
                        </Link>
                    </div>
                </motion.div>

                <AnimatePresence>
                    {showShareCard && (
                        <ShareCard
                            industry={industry}
                            mode="daily"
                            guessedAtStage={currentStage}
                            totalStages={4}
                            streak={0}
                            score={won ? (5 - currentStage) * 100 : 0}
                            movieTitle={dailyData.movie?.title}
                            onClose={() => setShowShareCard(false)}
                        />
                    )}
                </AnimatePresence>
            </AnimatedGradient>
        );
    }

    // Main Game
    return (
        <AnimatedGradient className="min-h-screen">
            <CategoryBackground industry={industry} />
            <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-6"
                >
                    <div className="flex items-center gap-3">
                        <Link href="/daily" className="text-neutral-400 hover:text-white transition-colors">
                            ← Exit
                        </Link>
                        <SoundToggle isMuted={isMuted} onToggle={toggleMute} />
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full glass border border-amber-500/30">
                        <span className="text-amber-400">📅</span>
                        <span className="text-neutral-300 text-sm font-medium">Daily Challenge</span>
                    </div>
                </motion.div>

                {/* Stage Content */}
                <StageTransition stage={currentStage}>
                    <div className="mb-6">
                        {getStageContent()}
                    </div>
                </StageTransition>

                {/* Film Strip Progress */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-6"
                >
                    <FilmStripProgress
                        currentStage={currentStage}
                        totalStages={4}
                        industry={industry}
                    />
                </motion.div>

                {/* Result Feedback */}
                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-center mb-4 p-3 rounded-lg bg-red-500/20 text-red-400"
                        >
                            {result.message}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Input */}
                <motion.form
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row gap-3"
                >
                    <AutocompleteInput
                        value={guess}
                        onChange={(e) => setGuess(e.target.value)}
                        onSubmit={handleSubmit}
                        placeholder="Enter movie name..."
                        industry={industry}
                        disabled={loading}
                        shakeOnError={shakeInput}
                        className="flex-1"
                    />
                    <button
                        type="submit"
                        disabled={loading || !guess.trim()}
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Guess
                    </button>
                </motion.form>
            </div>
        </AnimatedGradient>
    );
}
