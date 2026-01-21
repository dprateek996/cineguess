"use client";
import { useEffect, useState, use, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSound } from "@/hooks/useSound";
import GameIntro from "@/components/ui/game-intro";
import SceneImage from "@/components/ui/scene-image";
import TypewriterDialogue from "@/components/ui/typewriter-dialogue";
import EmojiClue from "@/components/ui/emoji-clue";
import MinimalHUD from "@/components/ui/minimal-hud";
import VerticalFilmStrip from "@/components/ui/vertical-film-strip";
import AutocompleteInput from "@/components/ui/autocomplete-input";
import ShareCard from "@/components/ui/share-card";
import { FilmGrain } from "@/components/ui/film-grain";
import Link from "next/link";
import { Film, Clapperboard, Sparkles, Globe, ImageIcon, Zap, XCircle, PartyPopper, Star, Trophy, Check } from "lucide-react";

const industryConfig = {
    BOLLYWOOD: {
        name: "Bollywood",
        Icon: Film,
        confettiColors: ["#f97316", "#fbbf24", "#ef4444", "#ec4899"],
    },
    HOLLYWOOD: {
        name: "Hollywood",
        Icon: Clapperboard,
        confettiColors: ["#3b82f6", "#06b6d4", "#8b5cf6", "#fbbf24"],
    },
    ANIME: {
        name: "Anime",
        Icon: Sparkles,
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
    const [showCorrectAnimation, setShowCorrectAnimation] = useState(false);

    const config = industryConfig[industry] || industryConfig.HOLLYWOOD;

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const key = `cineguess_daily_${industry}_${today}`;
        if (localStorage.getItem(key) === 'true') {
            setAlreadyPlayed(true);
        }
    }, [industry]);

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
                setShowCorrectAnimation(true);

                import("canvas-confetti").then((confetti) => {
                    confetti.default({
                        particleCount: 200,
                        spread: 100,
                        origin: { y: 0.6 },
                        colors: config.confettiColors,
                    });
                });

                setTimeout(() => {
                    setGameOver(true);
                    markAsPlayed(true);
                }, 2000);

            } else {
                playWrong();
                setShakeInput(true);
                setTimeout(() => setShakeInput(false), 500);

                if (currentStage < 3) {
                    playTransition();
                    setCurrentStage(prev => prev + 1);
                } else {
                    playGameOver();
                    setGameOver(true);
                    markAsPlayed(false);
                }
            }
        } catch (error) {
            console.error("Submit error:", error);
        }
    };

    const getStageContent = () => {
        if (!dailyData?.movie?.hints) return null;
        const hints = dailyData.movie.hints;
        const movie = dailyData.movie;

        switch (currentStage) {
            case 1:
                return (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative h-full aspect-[2/3] max-h-[60vh] mx-auto rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-zinc-900/40"
                    >
                        {movie.posterPath ? (
                            <motion.img
                                src={`https://image.tmdb.org/t/p/w780${movie.posterPath}`}
                                alt="Movie Poster"
                                className="absolute inset-0 w-full h-full object-cover"
                                style={{ filter: `blur(${hints.level1Blur || 25}px)`, transform: 'scale(1.15)' }}
                            />
                        ) : (
                            <div className="absolute inset-0 bg-zinc-900/50" />
                        )}

                        <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/20 to-black/60" />

                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/80 backdrop-blur-md border border-white/10 shadow-xl">
                            <ImageIcon className="w-4 h-4 text-white/70" strokeWidth={1.5} />
                            <span className="text-[10px] text-white/90 uppercase tracking-widest font-bold">Blurred Poster</span>
                        </div>
                    </motion.div>
                );
            case 2:
                return <TypewriterDialogue dialogue={hints.level2Dialogue} typingSpeed={40} />;
            case 3:
                return <SceneImage backdropPath={movie.backdropPath} alt="Movie Scene" />;
            default:
                return null;
        }
    };

    const AmbientBackground = () => (
        <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--gradient-center)_0%,_transparent_65%)] opacity-30 blur-3xl [--gradient-center:theme(colors.primary.DEFAULT/10)]" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background/0 to-transparent blur-3xl opacity-50" />
            <FilmGrain />
        </div>
    );

    if (showIntro) {
        return <GameIntro onComplete={() => setShowIntro(false)} industry={industry} />;
    }

    if (alreadyPlayed && !gameOver) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
                <AmbientBackground />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center rounded-3xl p-10 max-w-lg relative z-10 bg-zinc-900/40 backdrop-blur-md border border-white/10 shadow-2xl"
                >
                    <div className="flex justify-center mb-6">
                        <Check className="w-20 h-20 text-emerald-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">
                        Already Played Today!
                    </h2>
                    <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
                        Come back tomorrow for a new {config.name} daily challenge.
                    </p>
                    <Link href="/daily" className="px-8 py-3 bg-primary text-black rounded-full font-bold uppercase tracking-widest text-xs hover:scale-105 transition-transform inline-block">
                        ← Back to Daily
                    </Link>
                </motion.div>
            </div>
        );
    }

    if (loading) {
        const LoadingIcon = config.Icon;
        return (
            <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
                <AmbientBackground />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center relative z-10 p-8 rounded-3xl bg-zinc-900/50 backdrop-blur-md border border-white/5"
                >
                    <motion.div
                        className="mb-6 relative inline-block"
                        animate={{
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0],
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <LoadingIcon className="w-16 h-16 text-primary" strokeWidth={1.5} />
                    </motion.div>
                    <p className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold">Loading daily challenge...</p>
                </motion.div>
            </div>
        );
    }

    if (!dailyData) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
                <AmbientBackground />
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center rounded-2xl p-8 max-w-md relative z-10 bg-zinc-900/40 backdrop-blur-md border border-white/10"
                >
                    <div className="flex justify-center mb-6">
                        <XCircle className="w-16 h-16 text-muted-foreground" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">No Challenge Today</h2>
                    <p className="text-muted-foreground mb-6 text-sm">The daily challenge for {config.name} isn't available yet.</p>
                    <Link href="/daily" className="px-6 py-3 bg-white/10 text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-white/20 transition-colors inline-block">Back to Daily</Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-row overflow-hidden bg-background relative selection:bg-primary/20">
            <VerticalFilmStrip
                currentStage={gameOver ? 3 : currentStage}
                totalStages={3}
                industry={industry}
            />

            <main className="flex-1 relative flex flex-col min-w-0">
                <AmbientBackground />

                <div className="relative z-20">
                    <MinimalHUD
                        mode="Daily"
                        score={0}
                        isMuted={isMuted}
                        onToggleMute={toggleMute}
                        industry={industry}
                    />
                </div>

                <div className="flex-1 relative flex items-center justify-center p-4">
                    <AnimatePresence mode="wait">
                        {gameOver ? (
                            <motion.div
                                key="game-over"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="z-50 text-center rounded-3xl p-10 max-w-lg w-full relative -mt-10 bg-zinc-900/80 backdrop-blur-xl border border-white/10 shadow-2xl"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring" }}
                                    className="flex justify-center mb-6"
                                >
                                    {won ?
                                        <Trophy className="w-24 h-24 text-yellow-400 drop-shadow-2xl" strokeWidth={1.5} /> :
                                        <config.Icon className="w-24 h-24 text-white/20" strokeWidth={1.5} />
                                    }
                                </motion.div>

                                <h2 className="text-4xl font-extrabold mb-2 text-white tracking-tight">
                                    {won ? "You Got It!" : "Better Luck Next Time"}
                                </h2>

                                <p className="text-muted-foreground mb-8 text-xs uppercase tracking-widest">
                                    Daily {config.name} Challenge
                                </p>

                                <div className="rounded-xl p-6 mb-8 border border-white/5 bg-black/60 shadow-inner">
                                    <p className="text-muted-foreground text-[10px] uppercase tracking-wider mb-2 font-bold">The movie was</p>
                                    <p className="text-2xl font-bold text-white">{dailyData.movie?.title}</p>
                                </div>

                                <div className="flex items-center justify-center gap-2 mb-8">
                                    <span className="text-muted-foreground text-sm">Solved in</span>
                                    <div className={`px-4 py-1.5 rounded-full border font-bold text-xs uppercase tracking-wider ${won ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                                        {won ? `Stage ${currentStage}` : 'Failed'}
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <button
                                        onClick={() => setShowShareCard(true)}
                                        className="px-8 py-3 bg-white/10 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-white/20 transition-colors"
                                    >
                                        Share Result
                                    </button>
                                    <Link href="/daily" className="px-8 py-3 bg-primary text-black rounded-xl font-bold uppercase tracking-widest text-xs hover:scale-105 transition-transform">
                                        Back to Daily
                                    </Link>
                                </div>
                            </motion.div>
                        ) : showCorrectAnimation ? (
                            <motion.div
                                key="correct-overlay"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-40 flex items-center justify-center"
                            >
                                <div className="text-center relative z-10">
                                    <motion.div
                                        initial={{ rotate: -10, scale: 0 }}
                                        animate={{ rotate: 0, scale: 1 }}
                                        className="inline-block mb-4"
                                    >
                                        <PartyPopper className="w-24 h-24 text-primary" />
                                    </motion.div>
                                    <h2 className="text-6xl font-extrabold text-white drop-shadow-2xl tracking-tighter">Correct!</h2>
                                </div>
                            </motion.div>
                        ) : null}

                        <motion.div
                            key="stage-content"
                            className={`w-full h-full flex items-center justify-center transition-all duration-700 ${gameOver ? 'opacity-30 blur-sm scale-95 pointer-events-none absolute inset-0' : ''}`}
                        >
                            {gameOver || won ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="relative h-full aspect-[2/3] max-h-[70vh] mx-auto rounded-3xl overflow-hidden shadow-2xl border border-white/10"
                                >
                                    <img
                                        src={`https://image.tmdb.org/t/p/w780${dailyData.movie?.posterPath}`}
                                        alt={dailyData.movie?.title}
                                        className="w-full h-full object-cover"
                                    />
                                </motion.div>
                            ) : (
                                getStageContent()
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {!gameOver && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 20, opacity: 0 }}
                        className="relative z-30 p-6 md:p-8"
                    >
                        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background via-background/90 to-transparent -z-10" />

                        <motion.form
                            onSubmit={handleSubmit}
                            className="max-w-2xl mx-auto w-full flex flex-col md:flex-row gap-3 items-stretch shadow-2xl shadow-black/50"
                        >
                            <div className="flex-1">
                                <AutocompleteInput
                                    value={guess}
                                    onChange={(e) => setGuess(e.target.value)}
                                    onSubmit={handleSubmit}
                                    placeholder="Enter movie name..."
                                    industry={industry}
                                    disabled={loading || showCorrectAnimation}
                                    shakeOnError={shakeInput}
                                    className="w-full"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !guess.trim() || showCorrectAnimation}
                                className={`
                                    relative overflow-hidden group
                                    px-8 h-12 md:h-auto rounded-2xl font-bold text-xs tracking-widest uppercase
                                    transition-all duration-300
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                    ${guess.length >= 3 && !loading
                                        ? "bg-white text-black shadow-lg shadow-white/20 hover:scale-[1.02] active:scale-95"
                                        : "bg-white/5 text-muted-foreground border border-white/5 hover:bg-white/10"}
                                `}
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    Guess
                                    {guess.length >= 3 && <span className="text-lg">↵</span>}
                                </span>
                            </button>
                        </motion.form>
                        <p className="text-center text-muted-foreground/50 text-[10px] mt-4 uppercase tracking-widest hidden md:block font-bold">
                            Press Enter to confirm
                        </p>
                    </motion.div>
                )}
            </main>

            <AnimatePresence>
                {showShareCard && (
                    <ShareCard
                        industry={industry}
                        mode="daily"
                        guessedAtStage={won ? currentStage : 4}
                        totalStages={3}
                        streak={0}
                        score={won ? (4 - currentStage) * 100 : 0}
                        movieTitle={dailyData.movie?.title}
                        onClose={() => setShowShareCard(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
