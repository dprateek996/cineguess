"use client";
import { useEffect, useState, use, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from 'html2canvas'; // For manual card saving
import { useGame } from "@/hooks/useGame";
import { useSound } from "@/hooks/useSound";
import GameIntro from "@/components/ui/game-intro";
import HandleModal from "@/components/ui/handle-modal";
import SceneImage from "@/components/ui/scene-image";
import TypewriterDialogue from "@/components/ui/typewriter-dialogue";
import TriviaCard from "@/components/ui/trivia-card";
import MinimalHUD from "@/components/ui/minimal-hud";
import VerticalFilmStrip from "@/components/ui/vertical-film-strip";
import AutocompleteInput from "@/components/ui/autocomplete-input";
import ShareCard from "@/components/ui/share-card";
import { FilmGrain } from "@/components/ui/film-grain";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Icons } from "@/components/Icons";
import {
    Frown, Zap,
    Image as ImageIcon, PartyPopper, Star,
} from "lucide-react";
import Link from "next/link";

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
    GLOBAL: {
        name: "Global",
        Icon: Icons.Global,
        confettiColors: ["#10b981", "#14b8a6", "#22c55e", "#a3e635"],
    },
};

export default function PlayPage({ params }) {
    const { industry: rawIndustry } = use(params);
    const industry = rawIndustry?.toUpperCase() || "HOLLYWOOD";
    const { session, loading, error, result, initGame, submitGuess, endGame, resetGame, loseLife } = useGame();
    const { isMuted, toggleMute, playCorrect, playWrong, playTransition, playStart, playGameOver } = useSound();
    const [guess, setGuess] = useState("");
    const [shakeInput, setShakeInput] = useState(false);

    // Check if intro was already shown in this session
    const [showIntro, setShowIntro] = useState(() => {
        if (typeof window !== 'undefined') {
            const introShown = sessionStorage.getItem(`cineguess_intro_${industry}`);
            return !introShown; // Show intro if NOT already shown
        }
        return true;
    });

    const [showHandleModal, setShowHandleModal] = useState(false);
    const [userHandle, setUserHandle] = useState(null);
    const [gameMode, setGameMode] = useState('classic');

    // Show mode select only if intro is skipped (already shown)
    const [showModeSelect, setShowModeSelect] = useState(() => {
        if (typeof window !== 'undefined') {
            const introShown = sessionStorage.getItem(`cineguess_intro_${industry}`);
            return !!introShown; // Show mode select if intro was already shown
        }
        return false;
    });

    const [isDownloading, setIsDownloading] = useState(false);
    const [currentStage, setCurrentStage] = useState(1);
    const [showCorrectAnimation, setShowCorrectAnimation] = useState(false);
    const [guessedAtStage, setGuessedAtStage] = useState(null);
    const [showShareCard, setShowShareCard] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null);
    const [lives, setLives] = useState(3);
    const [imgError, setImgError] = useState(false);
    const timerRef = useRef(null);

    const [showFeedback, setShowFeedback] = useState(false);
    const config = industryConfig[industry] || industryConfig.HOLLYWOOD;

    // Reset feedback on stage change
    useEffect(() => {
        setShowFeedback(false);
        setImgError(false);
    }, [currentStage, session?.posterPath]);

    // Show feedback when result updates
    useEffect(() => {
        if (result && !result.isCorrect) {
            setShowFeedback(true);
            const timer = setTimeout(() => setShowFeedback(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [result]);

    // Initialize lives and stage when session starts  
    useEffect(() => {
        if (session?.mode === 'rapidfire') {
            setLives(session?.lives ?? 3);
        }
        if (session?.currentStage) {
            setCurrentStage(session.currentStage);
        }
    }, [session?.sessionId, session?.mode, session?.lives, session?.currentStage]);

    // Timer for rapid fire mode
    useEffect(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        if (session?.mode === 'rapidfire' && !session?.isGameOver && lives > 0) {
            const initialTime = session?.timeLimit || 30;
            setTimeLeft(initialTime);

            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        timerRef.current = null;
                        setTimeout(() => handleTimeUp(), 0);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [session?.sessionId, session?.currentRound, session?.mode, session?.isGameOver]);

    const handleTimeUp = async () => {
        if (session?.mode === 'rapidfire') {
            setLives(prevLives => {
                const newLives = prevLives - 1;
                if (newLives <= 0) {
                    endGame('timeout');
                }
                return newLives;
            });
            loseLife();

            if (lives > 1 && currentStage < 3) {
                setCurrentStage(prev => prev + 1);
                setTimeLeft(session?.timeLimit || 30);
                if (timerRef.current) clearInterval(timerRef.current);
                timerRef.current = setInterval(() => {
                    setTimeLeft(prev => {
                        if (prev <= 1) {
                            clearInterval(timerRef.current);
                            timerRef.current = null;
                            setTimeout(() => handleTimeUp(), 0);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            }
        }
    };

    useEffect(() => {
        const savedHandle = localStorage.getItem("cineguess_handle");
        if (savedHandle) setUserHandle(savedHandle);
    }, []);

    const startGame = useCallback((mode) => {
        setGameMode(mode);
        setShowModeSelect(false);
        const savedHandle = localStorage.getItem("cineguess_handle");
        if (!savedHandle) {
            setShowHandleModal(true);
        } else {
            setUserHandle(savedHandle);
            initGame(industry, mode);
            setCurrentStage(1);
        }
    }, [industry, initGame]);

    const handleIntroComplete = useCallback(() => {
        // Mark intro as shown for this industry in current session
        sessionStorage.setItem(`cineguess_intro_${industry}`, 'true');
        setShowIntro(false);
        setShowModeSelect(true);
    }, [industry]);

    const handleHandleSubmit = useCallback((handle) => {
        setUserHandle(handle);
        setShowHandleModal(false);
        initGame(industry, gameMode);
        setCurrentStage(1);
    }, [industry, gameMode, initGame]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!guess.trim() || loading) return;

        try {
            const res = await submitGuess(guess.trim(), currentStage, timeLeft);
            setGuess("");

            if (res.status === "WRONG" && !res.isCorrect) {
                playWrong();
                setShakeInput(true);
                setTimeout(() => setShakeInput(false), 500);

                if (session?.mode === 'rapidfire') {
                    setLives(prev => {
                        const newLives = prev - 1;
                        if (newLives <= 0) {
                            playGameOver();
                            endGame('lives');
                        }
                        return newLives;
                    });
                    loseLife();

                    if (lives > 1 && currentStage < 3) {
                        playTransition();
                        setCurrentStage(prev => prev + 1);
                    }
                } else {
                    if (currentStage < 3) {
                        playTransition();
                        setCurrentStage(prev => prev + 1);
                    } else {
                        playGameOver();
                    }
                }
            } else if (res.isCorrect) {
                playCorrect();
                setGuessedAtStage(currentStage);
                setShowCorrectAnimation(true);
                clearInterval(timerRef.current);

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
                    setShowCorrectAnimation(false);
                    setCurrentStage(1);
                    setGuessedAtStage(null);
                    if (session?.mode === 'rapidfire') {
                        setTimeLeft(res.nextMovie?.timeLimit || 30);
                    }
                }, 1500);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const getStageContent = () => {
        const allStages = session?.allStages;
        if (!allStages) return null;

        const stageInfo = allStages[currentStage];
        if (!stageInfo) return null;

        switch (stageInfo.type) {
            case 'scene':
                return (
                    <SceneImage
                        backdropPath={stageInfo.data.backdropPath || session?.backdropPath}
                        alt="Movie Scene"
                    />
                );
            case 'dialogue':
                return (
                    <TypewriterDialogue
                        dialogue={stageInfo.data.dialogue}
                        typingSpeed={40}
                    />
                );
            case 'trivia':
                return (
                    <TriviaCard
                        trivia={stageInfo.data.trivia}
                        industry={industry}
                    />
                );
            case 'poster':
                const posterPath = stageInfo.data.posterPath || session?.posterPath;
                return (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative h-full aspect-[2/3] max-h-[60vh] mx-auto rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-zinc-900/40"
                    >
                        {posterPath && !imgError ? (
                            <motion.img
                                key={posterPath}
                                src={`https://image.tmdb.org/t/p/w780${posterPath}`}
                                alt="Movie Poster"
                                className="absolute inset-0 w-full h-full object-cover"
                                style={{
                                    filter: `blur(${stageInfo.data.blurAmount || 15}px)`,
                                    transform: 'scale(1.1)',
                                }}
                                onError={() => setImgError(true)}
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                <div className="text-center">
                                    <config.Icon className="w-20 h-20 text-white/20 mx-auto mb-4" />
                                    <p className="text-white/40 text-xs uppercase tracking-widest font-medium">Poster Hidden</p>
                                </div>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/20 to-black/60" />
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/80 backdrop-blur-md border border-white/10 shadow-xl">
                            <ImageIcon className="w-4 h-4 text-white/70" />
                            <span className="text-[10px] text-white/90 uppercase tracking-widest font-bold">
                                {imgError || !posterPath ? "Poster Hidden" : "Blurred Poster"}
                            </span>
                        </div>
                    </motion.div>
                );
            default:
                return null;
        }
    };

    // Shared Ambient Background Component
    const AmbientBackground = () => (
        <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--gradient-center)_0%,_transparent_65%)] opacity-30 blur-3xl [--gradient-center:theme(colors.primary.DEFAULT/10)]" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background/0 to-transparent blur-3xl opacity-50" />
            <FilmGrain />
        </div>
    );

    if (showIntro) {
        return <GameIntro onComplete={handleIntroComplete} industry={industry} />;
    }

    // Mode Selection with Spotlight Cards
    if (showModeSelect) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background relative overflow-hidden selection:bg-primary/20">
                <AmbientBackground />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center w-full max-w-4xl relative z-10"
                >
                    <h2 className="text-5xl font-extrabold tracking-tighter text-white mb-3">Choose Your Mode</h2>
                    <p className="text-muted-foreground uppercase tracking-widest text-sm mb-12">{config.name} Cinema</p>

                    <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                        <div onClick={() => startGame('classic')} className="cursor-pointer">
                            <SpotlightCard className="h-full px-8 py-10 flex flex-col items-start gap-4 transition-transform hover:scale-[1.02] active:scale-[0.98]">
                                <div className="p-4 rounded-2xl bg-white/5 ring-1 ring-white/10">
                                    <Icons.Classic className="w-8 h-8 text-primary" />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-2xl font-bold text-white">Classic Endless</h3>
                                    <p className="text-muted-foreground text-sm mt-2 leading-relaxed">Relaxed pace. 3 stages of clues. Guess early for bonus points!</p>
                                </div>
                                <div className="mt-auto pt-4 flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest">
                                    <span>Play Classic</span> <Icons.Play className="w-3 h-3 fill-current" />
                                </div>
                            </SpotlightCard>
                        </div>

                        <div onClick={() => startGame('rapidfire')} className="cursor-pointer">
                            <SpotlightCard className="h-full px-8 py-10 flex flex-col items-start gap-4 transition-transform hover:scale-[1.02] active:scale-[0.98]">
                                <div className="p-4 rounded-2xl bg-white/5 ring-1 ring-white/10">
                                    <Icons.RapidFire className="w-8 h-8 text-red-500" />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-2xl font-bold text-white">Rapid Fire</h3>
                                    <p className="text-muted-foreground text-sm mt-2 leading-relaxed">Beat the clock! 3 lives. High intensity speed run.</p>
                                </div>
                                <div className="mt-auto pt-4 flex items-center gap-2 text-red-500 text-xs font-bold uppercase tracking-widest">
                                    <span>Start Run</span> <Icons.Play className="w-3 h-3 fill-current" />
                                </div>
                            </SpotlightCard>
                        </div>
                    </div>

                    <Link href="/" className="inline-block mt-12 text-muted-foreground hover:text-white transition-colors text-sm uppercase tracking-widest">
                        ← Back to Menu
                    </Link>
                </motion.div>
            </div>
        );
    }

    if (showHandleModal) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
                <AmbientBackground />
                <HandleModal isOpen={true} onSubmit={handleHandleSubmit} />
            </div>
        );
    }

    if (loading && !session) {
        const LoadingIcon = config.Icon;
        return (
            <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
                <AmbientBackground />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center relative z-10 flex flex-col items-center"
                >
                    <motion.div
                        className="mb-8 relative"
                        animate={{
                            rotate: [0, 5, -5, 0],
                            scale: [1, 1.05, 1],
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <div className="p-6 rounded-3xl bg-zinc-900/50 backdrop-blur-md border border-white/10 shadow-2xl">
                            <LoadingIcon className="w-16 h-16 text-primary" strokeWidth={1.5} />
                        </div>
                    </motion.div>

                    <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">
                        Setting the Scene...
                    </h2>
                    <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase">
                        {config.name} Cinema
                    </p>
                </motion.div>
            </div>
        );
    }

    if (error && !session) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
                <AmbientBackground />
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center p-8 max-w-md relative z-10 flex flex-col items-center bg-zinc-900/40 backdrop-blur-md rounded-3xl border border-white/10"
                >
                    <Frown className="w-12 h-12 text-muted-foreground mb-6" strokeWidth={1.5} />
                    <h2 className="text-xl font-bold text-white mb-2">Connection Error</h2>
                    <p className="text-muted-foreground mb-8 text-sm">{error}</p>
                    <Link href="/" className="px-6 py-3 bg-primary text-primary-foreground rounded-full text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity">
                        Return to Menu
                    </Link>
                </motion.div>
            </div>
        );
    }

    const getCinephileRating = (score) => {
        if (score >= 10000) return "Cinematic Legend";
        if (score >= 5000) return "Visionary Director";
        if (score >= 2000) return "Lead Actor";
        if (score >= 500) return "Supporting Role";
        return "Background Extra";
    };

    const getGuessTimeline = () => {
        const stage = guessedAtStage || (session?.isWon ? 3 : 4); // Default to 3/4 if state lost
        const isWin = session?.isWon || result?.isCorrect;

        // 1. Poster, 2. Dialogue, 3. Scene
        return (
            <div className="flex items-center gap-3 justify-center my-6">
                {/* Stage 1: Poster */}
                <div className={`flex flex-col items-center gap-2 group ${stage >= 1 ? 'opacity-100' : 'opacity-30'}`}>
                    <div className={`p-2.5 rounded-full ring-1 ring-white/5 shadow-lg transition-all duration-500 ${stage === 1 && isWin ? 'bg-emerald-500/20 text-emerald-400 ring-emerald-500/50 shadow-emerald-500/20' : 'bg-white/5 text-white/60'}`}>
                        <Icons.Bollywood className="w-3.5 h-3.5" />
                    </div>
                </div>
                <div className="w-8 h-px bg-white/20 rounded-full" />

                {/* Stage 2: Dialogue */}
                <div className={`flex flex-col items-center gap-2 group ${stage >= 2 ? 'opacity-100' : 'opacity-30'}`}>
                    <div className={`p-2.5 rounded-full ring-1 ring-white/5 shadow-lg transition-all duration-500 ${stage === 2 && isWin ? 'bg-emerald-500/20 text-emerald-400 ring-emerald-500/50 shadow-emerald-500/20' : 'bg-white/5 text-white/60'}`}>
                        <Icons.Classic className="w-3.5 h-3.5" />
                    </div>
                </div>
                <div className="w-8 h-px bg-white/20 rounded-full" />

                {/* Stage 3: Scene */}
                <div className={`flex flex-col items-center gap-2 group ${stage >= 3 ? 'opacity-100' : 'opacity-30'}`}>
                    <div className={`p-2.5 rounded-full ring-1 ring-white/5 shadow-lg transition-all duration-500 ${stage === 3 && isWin ? 'bg-emerald-500/20 text-emerald-400 ring-emerald-500/50 shadow-emerald-500/20' : 'bg-white/5 text-white/60'}`}>
                        <Icons.Hollywood className="w-3.5 h-3.5" />
                    </div>
                </div>

                {/* Result Icon */}
                <div className="ml-3 pl-3 border-l border-white/10">
                    {isWin ? (
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

    if (session?.isGameOver) {
        const rating = getCinephileRating(session?.totalScore || 0);
        const movieTitle = session?.correctAnswer || "Unknown Movie";
        const score = session?.totalScore || 0;
        const streak = session?.streak || 0;

        const handleDownloadCard = async () => {
            setIsDownloading(true);
            const cardElement = document.getElementById('stat-card-container');
            if (cardElement) {
                try {
                    const canvas = await html2canvas(cardElement, {
                        backgroundColor: null,
                        scale: 2, // Retain high quality
                        useCORS: true, // Allow cross-origin images (TMDB)
                        logging: false,
                    });
                    const image = canvas.toDataURL('image/png');
                    const link = document.createElement('a');
                    link.href = image;
                    link.download = `cineguess-stats-${Date.now()}.png`;
                    link.click();
                } catch (error) {
                    console.error('Failed to capture card:', error);
                }
            }
            setIsDownloading(false);
        };

        const shareText = `I just identified "${movieTitle}"! 🎞️✨\n\nScore: ${score} pts\nRank: ${rating} 👑\n\nCan you beat my streak? #CineGuess`;

        // Construct the viral share URL
        const origin = typeof window !== 'undefined' ? window.location.origin : 'https://cineguess.com';
        const sharePageUrl = `${origin}/share?title=${encodeURIComponent(movieTitle)}&score=${score}&rank=${encodeURIComponent(rating)}&poster=${encodeURIComponent(session?.posterPath || '')}&mode=Standard`;
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
                {session?.backdropPath && (
                    <div className="absolute inset-0 z-0">
                        <motion.div
                            initial={{ opacity: 0, scale: 1.2 }}
                            animate={{ opacity: 1, scale: 1.1 }}
                            transition={{ duration: 2, ease: "easeOut" }}
                            className="w-full h-full relative"
                        >
                            <img
                                src={`https://image.tmdb.org/t/p/original${session.backdropPath}`}
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
                    <div id="stat-card-container" className="bg-zinc-900/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl relative ring-1 ring-white/5">
                        {/* Card Header: Rating */}
                        <motion.div variants={itemVariants} className="bg-gradient-to-b from-white/5 to-transparent px-5 py-4 text-center border-b border-white/5 relative overflow-hidden">
                            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                            <p className="text-[9px] uppercase tracking-[0.3em] text-white/40 font-medium mb-2">Cinephile Rating</p>

                            {/* Text Masking & Glow */}
                            <div className="relative inline-block">
                                <h2 className="text-2xl sm:text-3xl font-black italic tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]">
                                    {rating}
                                </h2>
                                <div className="absolute -inset-4 bg-amber-400/20 blur-3xl opacity-20 rounded-full" />
                            </div>
                        </motion.div>

                        <div className="p-5 pt-4 flex flex-col items-center">
                            {/* Movie Reveal with 3D Tilt */}
                            <motion.div
                                variants={itemVariants}
                                className="mb-4 relative group cursor-default"
                                whileHover={{ scale: 1.02, rotateX: 5, rotateY: 5 }}
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            >
                                <div className="absolute -inset-4 bg-gradient-to-b from-white/5 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                <div className="relative w-28 aspect-[2/3] rounded-lg overflow-hidden ring-1 ring-white/20 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] group-hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.6)] transition-shadow duration-500">
                                    {session?.posterPath ? (
                                        <img
                                            src={`https://image.tmdb.org/t/p/w500${session.posterPath}`}
                                            alt={movieTitle}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                            <Icons.Classic className="w-10 h-10 text-white/20" />
                                        </div>
                                    )}
                                    {/* Glass Shine */}
                                    <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
                                    <div className="absolute -inset-full top-0 block bg-gradient-to-b from-transparent to-white/10 opacity-20 transform -translate-y-1/2 group-hover:translate-y-full transition-transform duration-1000 ease-in-out" />
                                </div>
                            </motion.div>

                            <motion.h3 variants={itemVariants} className="text-center text-lg font-bold text-white mb-1 leading-tight tracking-tight">
                                {movieTitle}
                            </motion.h3>
                            <motion.p variants={itemVariants} className="text-[9px] text-white/30 uppercase tracking-widest mb-4 font-medium">
                                {config.name} Collection
                            </motion.p>

                            {/* Guess Path Timeline - Minimalist Audit */}
                            <motion.div variants={itemVariants} className="w-full mb-4 relative">
                                <p className="sr-only">Guess Timeline</p>
                                {getGuessTimeline()}
                            </motion.div>

                            {/* Stats Grid - Ghost Containers */}
                            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 w-full mb-5">
                                <div className="group relative rounded-xl p-3 text-center border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                                    <p className="text-[9px] uppercase tracking-widest text-white/40 mb-0.5 group-hover:text-white/60 transition-colors">Score</p>
                                    <p className="text-xl font-bold text-white tabular-nums tracking-tight">{score}</p>
                                </div>
                                <div className="group relative rounded-xl p-3 text-center border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                                    <p className="text-[9px] uppercase tracking-widest text-white/40 mb-0.5 group-hover:text-white/60 transition-colors">Streak</p>
                                    <p className="text-xl font-bold text-white tabular-nums tracking-tight">{streak}</p>
                                </div>
                            </motion.div>

                            {/* Actions */}
                            <motion.div variants={itemVariants} className="flex flex-col w-full gap-2">
                                <a
                                    href={shareUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 w-full h-11 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 hover:border-sky-500/40 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all"
                                >
                                    Share Result
                                </a>

                                <button
                                    onClick={() => {
                                        resetGame();
                                        setShowModeSelect(true);
                                        setCurrentStage(1);
                                        setLives(3);
                                    }}
                                    className="flex items-center justify-center gap-2 w-full h-11 bg-amber-400 hover:bg-amber-300 text-black rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all shadow-[0_0_20px_-5px_rgba(251,191,36,0.5)] hover:shadow-[0_0_30px_-5px_rgba(251,191,36,0.6)] hover:scale-[1.02]"
                                >
                                    <Icons.Play className="w-3 h-3 fill-current" /> Play Again
                                </button>
                            </motion.div>
                        </div>
                    </div>

                    <motion.button
                        variants={itemVariants}
                        onClick={() => window.location.href = '/'}
                        className="w-full text-center mt-8 text-[10px] uppercase tracking-[0.2em] text-white/20 hover:text-white/40 transition-colors font-medium"
                    >
                        Return to Menu
                    </motion.button>


                </motion.div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-row overflow-hidden bg-background relative selection:bg-primary/20 selection:text-primary">
            <VerticalFilmStrip
                currentStage={currentStage}
                totalStages={3}
                industry={industry}
            />

            <main className="flex-1 relative flex flex-col min-w-0">
                <AmbientBackground />

                <div className="relative z-20">
                    <MinimalHUD
                        mode={session?.mode || 'classic'}
                        round={session?.currentRound || 1}
                        score={session?.totalScore || 0}
                        lives={lives}
                        timeLeft={session?.mode === 'rapidfire' ? timeLeft : null}
                        maxTime={session?.timeLimit || 30}
                        isMuted={isMuted}
                        onToggleMute={toggleMute}
                        industry={industry}
                        streak={session?.streak || 0}
                    />
                </div>

                <div className="flex-1 relative flex items-center justify-center p-4">
                    <AnimatePresence mode="wait">
                        {showCorrectAnimation ? (
                            <motion.div
                                key="correct-overlay"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xl"
                            >
                                <motion.div
                                    initial={{ scale: 0.9, y: 10 }}
                                    animate={{ scale: 1, y: 0 }}
                                    exit={{ scale: 0.9, opacity: 0 }}
                                    className="text-center"
                                >
                                    <motion.div
                                        initial={{ rotate: -10, scale: 0 }}
                                        animate={{ rotate: 0, scale: 1 }}
                                        transition={{ type: "spring", damping: 12 }}
                                        className="mb-6 relative z-10 drop-shadow-2xl flex justify-center"
                                    >
                                        <Icons.Success className="w-24 h-24 text-primary mx-auto" />
                                    </motion.div>
                                    <p className="text-4xl font-extrabold text-white tracking-tighter mb-4">That's right!</p>
                                    <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-zinc-900 border border-white/10 text-muted-foreground text-sm font-medium">
                                        <span className="text-white">+{result?.roundScore || 0} points</span>
                                        {guessedAtStage === 1 && (
                                            <span className="flex items-center gap-1 text-primary">
                                                <Star className="w-3 h-3 fill-current" /> Perfect
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="stage-content"
                                className="w-full h-full flex items-center justify-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                {getStageContent()}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {result && showFeedback && !result.isCorrect && !result.gameOver && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className={`
                                    absolute bottom-32 left-1/2 -translate-x-1/2 z-40
                                    px-6 py-3 rounded-full shadow-2xl border backdrop-blur-md
                                    flex items-center gap-3
                                    ${result.status === "NEAR_MISS"
                                        ? "bg-amber-900/40 border-amber-500/30 text-amber-500"
                                        : "bg-red-900/40 border-red-500/30 text-red-500"
                                    }
                                `}
                            >
                                <div className={`text-xl ${result.status === "NEAR_MISS" ? "text-amber-500" : "text-red-500"}`}>
                                    {result.status === "NEAR_MISS" ?
                                        <Zap className="w-5 h-5 fill-current" /> :
                                        <Icons.Fail className="w-5 h-5" />
                                    }
                                </div>
                                <div>
                                    <p className="font-bold text-[10px] uppercase tracking-widest">
                                        {result.status === "NEAR_MISS" ? "Close Call" : "Missed"}
                                    </p>
                                    <p className="text-[10px] opacity-80 font-medium mt-0.5 uppercase tracking-wide">{result.message}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="relative z-30 p-6 md:p-8">
                    <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background via-background/90 to-transparent -z-10" />

                    <motion.form
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        onSubmit={handleSubmit}
                        className="max-w-xl mx-auto w-full flex flex-col md:flex-row gap-3 items-stretch"
                    >
                        <div className="flex-1">
                            <AutocompleteInput
                                value={guess}
                                onChange={(e) => setGuess(e.target.value)}
                                onSubmit={handleSubmit}
                                placeholder="Type movie title..."
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
                                    ? "bg-white text-black shadow-lg shadow-white/10 hover:shadow-white/20 hover:scale-[1.02] active:scale-[0.98]"
                                    : "bg-white/5 text-muted-foreground border border-white/5"}
                            `}
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {loading ? (
                                    <span className="animate-pulse">Checking...</span>
                                ) : (
                                    <>
                                        Guess
                                        {guess.length >= 3 && <span className="text-sm">↵</span>}
                                    </>
                                )}
                            </span>
                        </button>
                    </motion.form>

                    <p className="text-center text-muted-foreground text-[10px] mt-4 uppercase tracking-widest hidden md:block opacity-50">
                        Press Enter to confirm
                    </p>
                </div>
            </main>
        </div>
    );
}
