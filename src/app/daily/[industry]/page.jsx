"use client";
import { useEffect, useState, use, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
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
import { BorderBeam } from "@/components/ui/border-beam";
import Link from "next/link";
import { Icons } from "@/components/Icons";
import { ImageIcon, Zap, XCircle } from "lucide-react";

const industryConfig = {
    BOLLYWOOD: {
        name: "Bollywood",
        Icon: Icons.Bollywood,
        confettiColors: ["#f97316", "#fbbf24", "#ef4444", "#ec4899"],
    },
    HOLLYWOOD: {
        name: "Hollywood",
        Icon: Icons.Hollywood,
        confettiColors: ["#3b82f6", "#06b6d4", "#8b5cf6", "#fbbf24"],
    },
    ANIME: {
        name: "Anime",
        Icon: Icons.Anime,
        confettiColors: ["#a855f7", "#ec4899", "#f472b6", "#c084fc"],
    },
};

export default function DailyGamePage({ params }) {
    const { industry } = use(params);
    const { isMuted, toggleMute, playCorrect, playWrong, playTransition, playGameOver } = useSound();

    // Check if intro was already shown in this session
    const [showIntro, setShowIntro] = useState(() => {
        if (typeof window !== 'undefined') {
            const introShown = sessionStorage.getItem(`cinequest_daily_intro_${industry}`);
            return !introShown; // Show intro if NOT already shown
        }
        return true;
    });
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
    const [isDownloading, setIsDownloading] = useState(false);
    const [currentStreak, setCurrentStreak] = useState(0);

    const config = industryConfig[industry] || industryConfig.HOLLYWOOD;

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const key = `cinequest_daily_${industry}_${today}`;
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
        const key = `cinequest_daily_${industry}_${today}`;
        localStorage.setItem(key, 'true');

        const statsKey = `cinequest_daily_stats_${industry}`;
        const stats = JSON.parse(localStorage.getItem(statsKey) || '{"played":0,"won":0,"streak":0}');
        stats.played++;
        if (didWin) {
            stats.won++;
            stats.streak++;
        } else {
            stats.streak = 0;
        }
        localStorage.setItem(statsKey, JSON.stringify(stats));
        localStorage.setItem(statsKey, JSON.stringify(stats));
        setCurrentStreak(stats.streak);
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
                        particleCount: 30,
                        spread: 40,
                        origin: { y: 0.6 },
                        colors: config.confettiColors,
                        disableForReducedMotion: true,
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
        return <GameIntro onComplete={() => {
            sessionStorage.setItem(`cinequest_daily_intro_${industry}`, 'true');
            setShowIntro(false);
        }} industry={industry} />;
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
                        <Icons.Success className="w-20 h-20 text-emerald-500" />
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
        // Show minimal loading while fetching daily data
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin mb-4 inline-block">
                        <Icons.Projector className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold">Loading...</p>
                </div>
            </div>
        );
    }

    // New tier system based on daily streak
    const getCinephileRating = (streak) => {
        if (streak >= 15) return { title: "THE AUTEUR", emoji: "👑", isPrestige: true };
        if (streak >= 10) return { title: "CINEMA LEGEND", emoji: "🏆", isPrestige: false };
        if (streak >= 5) return { title: "MOVIE BUFF", emoji: "🎥", isPrestige: false };
        if (streak >= 2) return { title: "CASUAL VIEWER", emoji: "🎟️", isPrestige: false };
        return { title: "DELETED SCENE", emoji: "💀", isPrestige: false };
    };

    const getGuessTimeline = () => {
        const stage = won ? currentStage : 4;

        // 1. Poster, 2. Dialogue, 3. Scene
        return (
            <div className="flex items-center gap-3 justify-center my-6">
                {/* Stage 1: Poster */}
                <div className={`flex flex-col items-center gap-2 group ${stage >= 1 ? 'opacity-100' : 'opacity-30'}`}>
                    <div className={`p-2.5 rounded-full ring-1 ring-white/5 shadow-lg transition-all duration-500 ${stage === 1 && won ? 'bg-emerald-500/20 text-emerald-400 ring-emerald-500/50 shadow-emerald-500/20' : 'bg-white/5 text-white/60'}`}>
                        <Icons.Bollywood className="w-3.5 h-3.5" />
                    </div>
                </div>
                <div className="w-8 h-px bg-white/20 rounded-full" />

                {/* Stage 2: Dialogue */}
                <div className={`flex flex-col items-center gap-2 group ${stage >= 2 ? 'opacity-100' : 'opacity-30'}`}>
                    <div className={`p-2.5 rounded-full ring-1 ring-white/5 shadow-lg transition-all duration-500 ${stage === 2 && won ? 'bg-emerald-500/20 text-emerald-400 ring-emerald-500/50 shadow-emerald-500/20' : 'bg-white/5 text-white/60'}`}>
                        <Icons.Classic className="w-3.5 h-3.5" />
                    </div>
                </div>
                <div className="w-8 h-px bg-white/20 rounded-full" />

                {/* Stage 3: Scene */}
                <div className={`flex flex-col items-center gap-2 group ${stage >= 3 ? 'opacity-100' : 'opacity-30'}`}>
                    <div className={`p-2.5 rounded-full ring-1 ring-white/5 shadow-lg transition-all duration-500 ${stage === 3 && won ? 'bg-emerald-500/20 text-emerald-400 ring-emerald-500/50 shadow-emerald-500/20' : 'bg-white/5 text-white/60'}`}>
                        <Icons.Hollywood className="w-3.5 h-3.5" />
                    </div>
                </div>

                {/* Result Icon */}
                <div className="ml-3 pl-3 border-l border-white/10">
                    {won ? (
                        <div className="p-1 rounded-full bg-emerald-500/10">
                            <Icons.Success className="w-5 h-5 text-emerald-400" />
                        </div>
                    ) : (
                        <div className="p-1 rounded-full bg-red-500/10">
                            <Icons.Fail className="w-5 h-5 text-red-400/80" />
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (gameOver && dailyData) {
        const score = won ? (4 - currentStage) * 100 : 0;
        const rating = getCinephileRating(currentStreak);
        const movieTitle = dailyData.movie?.title || "Unknown Movie";

        const handleDownloadCard = async () => {
            setIsDownloading(true);
            const cardElement = document.getElementById('daily-stat-card');
            if (cardElement) {
                try {
                    const canvas = await html2canvas(cardElement, {
                        backgroundColor: null,
                        scale: 2,
                        useCORS: true,
                        logging: false,
                    });
                    const image = canvas.toDataURL('image/png');
                    const link = document.createElement('a');
                    link.href = image;
                    link.download = `cinequest-daily-${Date.now()}.png`;
                    link.click();
                } catch (error) {
                    console.error('Failed to capture card:', error);
                }
            }
            setIsDownloading(false);
        };

        const shareText = `I just solved the Daily ${config.name} Challenge! 🎞️✨\n\nMovie: ${movieTitle}\nScore: ${score} pts\nRank: ${rating.title} ${rating.emoji}\n\n#CineQuestDaily`;

        // Construct the viral share URL
        const origin = typeof window !== 'undefined' ? window.location.origin : 'https://cinequest.com';
        const sharePageUrl = `${origin}/share?title=${encodeURIComponent(movieTitle)}&score=${score}&rank=${encodeURIComponent(rating.title)}&poster=${encodeURIComponent(dailyData.movie?.posterPath || '')}&mode=Daily`;
        const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(sharePageUrl)}`;

        const containerVariants = {
            hidden: { opacity: 0 },
            visible: {
                opacity: 1,
                transition: {
                    when: "beforeChildren",
                    staggerChildren: 0.15
                }
            }
        };

        const itemVariants = {
            hidden: { opacity: 0, y: 20 },
            visible: {
                opacity: 1,
                y: 0,
                transition: { type: "spring", stiffness: 300, damping: 24 }
            }
        };

        return (
            <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden font-sans selection:bg-amber-500/30">
                {/* Cinematic Backdrop */}
                {dailyData.movie?.backdropPath && (
                    <div className="absolute inset-0 z-0">
                        <motion.div
                            initial={{ opacity: 0, scale: 1.2 }}
                            animate={{ opacity: 1, scale: 1.1 }}
                            transition={{ duration: 2, ease: "easeOut" }}
                            className="w-full h-full relative"
                        >
                            <img
                                src={`https://image.tmdb.org/t/p/original${dailyData.movie.backdropPath}`}
                                alt="Background"
                                className="w-full h-full object-cover opacity-20 blur-2xl grayscale"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
                        </motion.div>
                    </div>
                )}
                <FilmGrain />

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-md relative z-10 perspective-1000"
                >
                    {/* The Viral Stat Card */}
                    <div id="daily-stat-card" className={`bg-zinc-900/60 backdrop-blur-2xl border ${rating.isPrestige ? 'border-amber-300/40' : 'border-white/10'} rounded-[2rem] overflow-hidden shadow-2xl relative ring-1 ${rating.isPrestige ? 'ring-amber-300/50' : 'ring-white/5'}`}>
                        {rating.isPrestige && (
                            <BorderBeam
                                size={300}
                                duration={8}
                                colorFrom="#ffd700"
                                colorTo="#fff8dc"
                                borderWidth={2}
                            />
                        )}
                        {/* Card Header: Rating */}
                        <motion.div variants={itemVariants} className="bg-gradient-to-b from-white/5 to-transparent p-8 pb-6 text-center border-b border-white/5 relative overflow-hidden">
                            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-medium mb-3">Daily Rank</p>

                            {/* Text Masking & Glow */}
                            <div className="relative inline-block">
                                <h2 className={`text-3xl sm:text-4xl font-black italic tracking-tight text-transparent bg-clip-text ${rating.isPrestige ? 'bg-gradient-to-r from-amber-100 via-white to-amber-100' : 'bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200'} drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]`}>
                                    {rating.title}
                                </h2>
                                <p className="text-4xl mt-3">{rating.emoji}</p>
                                <div className={`absolute -inset-4 ${rating.isPrestige ? 'bg-amber-100/30' : 'bg-amber-400/20'} blur-3xl opacity-20 rounded-full`} />
                            </div>
                        </motion.div>

                        <div className="p-8 pt-6 flex flex-col items-center">
                            {/* Movie Reveal with 3D Tilt */}
                            <motion.div
                                variants={itemVariants}
                                className="mb-8 relative group cursor-default"
                                whileHover={{ scale: 1.02, rotateX: 5, rotateY: 5 }}
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            >
                                <div className="absolute -inset-4 bg-gradient-to-b from-white/5 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                <div className="relative w-36 aspect-[2/3] rounded-lg overflow-hidden ring-1 ring-white/20 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] group-hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.6)] transition-shadow duration-500">
                                    {dailyData.movie?.posterPath ? (
                                        <img
                                            src={`https://image.tmdb.org/t/p/w500${dailyData.movie.posterPath}`}
                                            alt={movieTitle}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                            <Icons.Daily className="w-10 h-10 text-white/20" />
                                        </div>
                                    )}
                                    {/* Glass Shine */}
                                    <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
                                    <div className="absolute -inset-full top-0 block bg-gradient-to-b from-transparent to-white/10 opacity-20 transform -translate-y-1/2 group-hover:translate-y-full transition-transform duration-1000 ease-in-out" />
                                </div>
                            </motion.div>

                            <motion.h3 variants={itemVariants} className="text-center text-xl font-bold text-white mb-1.5 leading-tight tracking-tight">
                                {movieTitle}
                            </motion.h3>
                            <motion.p variants={itemVariants} className="text-[10px] text-white/30 uppercase tracking-widest mb-8 font-medium">
                                {config.name} Daily
                            </motion.p>

                            {/* Guess Path Timeline - Minimalist Audit */}
                            <motion.div variants={itemVariants} className="w-full mb-8 relative">
                                <p className="sr-only">Guess Timeline</p>
                                {getGuessTimeline()}
                            </motion.div>

                            {/* Stats Grid - Ghost Containers */}
                            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 w-full mb-8">
                                <div className="group relative rounded-2xl p-4 text-center border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                                    <p className="text-[9px] uppercase tracking-widest text-white/40 mb-1 group-hover:text-white/60 transition-colors">Score</p>
                                    <p className="text-2xl font-bold text-white tabular-nums tracking-tight">{score}</p>
                                </div>
                                <div className="group relative rounded-2xl p-4 text-center border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                                    <p className="text-[9px] uppercase tracking-widest text-white/40 mb-1 group-hover:text-white/60 transition-colors">Result</p>
                                    <p className={`text-2xl font-bold tabular-nums tracking-tight ${won ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {won ? 'WON' : 'LOST'}
                                    </p>
                                </div>
                            </motion.div>

                            {/* Actions - Contrast Balance */}
                            <motion.div variants={itemVariants} className="flex flex-col w-full gap-3">
                                <a
                                    href={shareUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 w-full h-12 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 hover:border-sky-500/40 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all"
                                >
                                    Share Result
                                </a>

                                <button
                                    onClick={handleDownloadCard}
                                    disabled={isDownloading}
                                    className="flex items-center justify-center gap-2 w-full h-12 bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all"
                                >
                                    {isDownloading ? 'Capturing...' : (
                                        <>
                                            <Icons.Download className="w-4 h-4" /> Save Image
                                        </>
                                    )}
                                </button>

                                <Link
                                    href="/daily"
                                    className="flex items-center justify-center gap-2 w-full h-12 bg-amber-400 hover:bg-amber-300 text-black rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all shadow-[0_0_20px_-5px_rgba(251,191,36,0.5)] hover:shadow-[0_0_30px_-5px_rgba(251,191,36,0.6)] hover:scale-[1.02]"
                                >
                                    <Icons.Play className="w-3 h-3 fill-current" /> Back to Daily
                                </Link>

                                <Link
                                    href="/"
                                    className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all active:scale-95 mt-3"
                                >
                                    <span className="uppercase tracking-[0.2em] text-[10px] font-bold">Return to Menu</span>
                                </Link>
                            </motion.div>
                        </div>
                    </div>
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
                        <Icons.Fail className="w-16 h-16 text-muted-foreground" strokeWidth={1.5} />
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
                        {/* Game Content Rendered Here (Replaced original conditional block since gameOver is handled early now) */}
                        <motion.div
                            key="stage-content"
                            className="w-full h-full flex items-center justify-center transition-all duration-700"
                        >
                            {getStageContent()}
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
