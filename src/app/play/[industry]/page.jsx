"use client";
import { useEffect, useState, use, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/hooks/useGame";
import { useSound } from "@/hooks/useSound";
import GameIntro from "@/components/ui/game-intro";
import HandleModal from "@/components/ui/handle-modal";
import SceneImage from "@/components/ui/scene-image";
import TypewriterDialogue from "@/components/ui/typewriter-dialogue";
import TriviaCard from "@/components/ui/trivia-card";
import StageTransition from "@/components/ui/stage-transition";
import MinimalHUD from "@/components/ui/minimal-hud";
import VerticalFilmStrip from "@/components/ui/vertical-film-strip";
import AutocompleteInput from "@/components/ui/autocomplete-input";
import ShareCard from "@/components/ui/share-card";
import {
    Clapperboard, Film, Sparkles, Globe, Frown, Target, Zap,
    Image as ImageIcon, PartyPopper, Star, XCircle, Trophy
} from "lucide-react";

import { CinematicBackground } from "@/components/ui/cinematic-background";
import Link from "next/link";


const industryConfig = {
    BOLLYWOOD: {
        name: "Bollywood",
        gradient: "from-orange-500 to-yellow-500",
        glow: "rgba(249, 115, 22, 0.3)",
        Icon: Film,
        confettiColors: ["#f97316", "#fbbf24", "#ef4444", "#ec4899"],
    },
    HOLLYWOOD: {
        name: "Hollywood",
        gradient: "from-blue-600 to-cyan-400",
        glow: "rgba(37, 99, 235, 0.3)",
        Icon: Clapperboard,
        confettiColors: ["#3b82f6", "#06b6d4", "#8b5cf6", "#fbbf24"],
    },
    ANIME: {
        name: "Anime",
        gradient: "from-purple-600 to-pink-500",
        glow: "rgba(147, 51, 234, 0.3)",
        Icon: Sparkles,
        confettiColors: ["#a855f7", "#ec4899", "#f472b6", "#c084fc"],
    },
    GLOBAL: {
        name: "Global",
        gradient: "from-emerald-500 to-teal-400",
        glow: "rgba(16, 185, 129, 0.3)",
        Icon: Globe,
        confettiColors: ["#10b981", "#14b8a6", "#22c55e", "#a3e635"],
    },
};

const categoryColors = {
    BOLLYWOOD: "#f97316",
    HOLLYWOOD: "#3b82f6",
    ANIME: "#a855f7",
    GLOBAL: "#10b981",
};

export default function PlayPage({ params }) {
    const { industry: rawIndustry } = use(params);
    const industry = rawIndustry?.toUpperCase() || "HOLLYWOOD";
    const { session, loading, error, result, initGame, submitGuess, endGame, resetGame, loseLife } = useGame();
    const { isMuted, toggleMute, playCorrect, playWrong, playTransition, playStart, playGameOver } = useSound();
    const [guess, setGuess] = useState("");
    const [shakeInput, setShakeInput] = useState(false);
    const [showIntro, setShowIntro] = useState(true);
    const [showHandleModal, setShowHandleModal] = useState(false);
    const [userHandle, setUserHandle] = useState(null);
    const [gameMode, setGameMode] = useState('classic');
    const [showModeSelect, setShowModeSelect] = useState(false);
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
            // Auto hide after 3 seconds
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
        // RAPID FIRE TIMEOUT: Always lose a life
        if (session?.mode === 'rapidfire') {
            setLives(prevLives => {
                const newLives = prevLives - 1;
                if (newLives <= 0) {
                    endGame('timeout');
                }
                return newLives;
            });
            loseLife(); // Sync hook state

            // If we survived, try to help by advancing stage
            if (lives > 1 && currentStage < 3) {
                setCurrentStage(prev => prev + 1);
                setTimeLeft(session?.timeLimit || 30);

                // Restart timer
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

    // Check for saved handle on mount
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
        setShowIntro(false);
        setShowModeSelect(true);
    }, []);

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
                playWrong();  // Sound effect
                setShakeInput(true);
                setTimeout(() => setShakeInput(false), 500);

                if (session?.mode === 'rapidfire') {
                    // RAPID FIRE: Lose life on any wrong guess
                    setLives(prev => {
                        const newLives = prev - 1;
                        if (newLives <= 0) {
                            playGameOver();
                            endGame('lives');
                        }
                        return newLives;
                    });
                    loseLife(); // Sync hook state

                    // Still advance stage if we have lives left
                    if (lives > 1 && currentStage < 3) {
                        playTransition();
                        setCurrentStage(prev => prev + 1);
                    }
                } else {
                    // CLASSIC: Only game over at stage 3
                    if (currentStage < 3) {
                        playTransition();  // Stage transition sound
                        setCurrentStage(prev => prev + 1);
                    } else {
                        playGameOver();
                    }
                }
            } else if (res.isCorrect) {
                // Success! 
                playCorrect();  // Sound effect
                setGuessedAtStage(currentStage);
                setShowCorrectAnimation(true);
                clearInterval(timerRef.current);

                // Category-themed confetti
                import("canvas-confetti").then((confetti) => {
                    confetti.default({
                        particleCount: 150,
                        spread: 80,
                        origin: { y: 0.6 },
                        colors: config.confettiColors,
                    });
                });

                // Brief pause then continue
                setTimeout(() => {
                    setShowCorrectAnimation(false);
                    setCurrentStage(1);  // Reset to Stage 1 for next movie
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

    // Get current stage data
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
                // Use posterPath from stage data first, fallback to session
                const posterPath = stageInfo.data.posterPath || session?.posterPath;
                return (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative h-full aspect-[2/3] max-h-[60vh] mx-auto rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-[#111]"
                        style={{ boxShadow: `0 0 100px ${config.glow}` }}
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
                            <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-20 flex items-center justify-center`}>
                                <div className="text-center">
                                    <config.Icon className="w-20 h-20 text-white/20 mx-auto mb-4" strokeWidth={1} />
                                    <p className="text-white/40 text-xs uppercase tracking-widest font-medium">Poster Hidden</p>
                                </div>
                            </div>
                        )}

                        {/* Cinematic Vignette */}
                        <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/20 to-black/60" />

                        {/* Floating Label */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10 shadow-xl">
                            <ImageIcon className="w-5 h-5 text-neutral-200" strokeWidth={1.5} />
                            <span className="text-xs text-neutral-200 uppercase tracking-widest font-bold">
                                {imgError || !posterPath ? "Poster Hidden" : "Blurred Poster"}
                            </span>
                        </div>
                    </motion.div>
                );
            default:
                return null;
        }
    };

    // Show intro first
    if (showIntro) {
        return <GameIntro onComplete={handleIntroComplete} industry={industry} />;
    }

    // Mode selection
    if (showModeSelect) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 bg-[#0a0a0a] relative overflow-hidden">
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: "radial-gradient(ellipse at 50% 0%, rgba(30,30,40,0.5) 0%, transparent 70%)",
                    }}
                />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-lg w-full"
                >
                    <h2 className="text-3xl font-bold text-white mb-2">Choose Your Mode</h2>
                    <p className="text-neutral-400 mb-8">{config.name} Cinema</p>

                    <div className="grid gap-4">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => startGame('classic')}
                            className="glass rounded-2xl p-6 text-left border border-neutral-700/50 hover:border-neutral-600 transition-all group"
                        >
                            <div className="flex items-center gap-5">
                                <div className="p-3 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                                    <Target className="w-8 h-8 text-neutral-300 group-hover:text-white" strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Classic Endless</h3>
                                    <p className="text-neutral-400 text-sm mt-1">4 stages of clues. Guess at any stage for bonus points!</p>
                                </div>
                            </div>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => startGame('rapidfire')}
                            className="glass rounded-2xl p-6 text-left border border-neutral-700/50 hover:border-red-500/50 transition-all group"
                        >
                            <div className="flex items-center gap-5">
                                <div className="p-3 rounded-full bg-white/5 group-hover:bg-red-500/10 transition-colors">
                                    <Zap className="w-8 h-8 text-neutral-300 group-hover:text-red-400" strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Rapid Fire</h3>
                                    <p className="text-neutral-400 text-sm mt-1">Beat the clock! 3 lives. Speed bonuses.</p>
                                </div>
                            </div>
                        </motion.button>
                    </div>

                    <Link href="/" className="inline-block mt-6 text-neutral-500 hover:text-white transition-colors">
                        ← Back to Menu
                    </Link>
                </motion.div>
            </div>
        );
    }

    // Handle modal
    if (showHandleModal) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden">
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: "radial-gradient(ellipse at 50% 0%, rgba(30,30,40,0.5) 0%, transparent 70%)",
                    }}
                />
                <HandleModal isOpen={true} onSubmit={handleHandleSubmit} />
            </div>
        );
    }

    // Loading state
    if (loading && !session) {
        const LoadingIcon = config.Icon;
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden">
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: "radial-gradient(ellipse at 50% 0%, rgba(30,30,40,0.5) 0%, transparent 70%)",
                    }}
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center relative z-10 flex flex-col items-center"
                >
                    <motion.div
                        className="mb-6 relative"
                        animate={{
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0],
                            filter: [`drop-shadow(0 0 10px ${config.glow})`, `drop-shadow(0 0 30px ${config.glow})`, `drop-shadow(0 0 10px ${config.glow})`]
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <LoadingIcon className="w-20 h-20 text-white opacity-90" strokeWidth={1.5} />
                    </motion.div>

                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400 mb-2">
                        Setting the Scene...
                    </h2>
                    <p className="text-neutral-500 text-sm tracking-widest uppercase">
                        {config.name} Cinema
                    </p>
                </motion.div>
            </div>
        );
    }

    // Error state
    if (error && !session) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden">
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: "radial-gradient(ellipse at 50% 0%, rgba(30,30,40,0.5) 0%, transparent 70%)",
                    }}
                />
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center glass rounded-2xl p-8 max-w-md relative z-10 flex flex-col items-center"
                >
                    <Frown className="w-16 h-16 text-neutral-500 mb-6" strokeWidth={1.5} />
                    <h2 className="text-xl font-bold text-white mb-2">Connection Error</h2>
                    <p className="text-neutral-400 mb-6">{error}</p>
                    <Link href="/" className="btn-primary">Return to Menu</Link>
                </motion.div>
            </div>
        );
    }

    // Game Over Screen - Immersive Redesign
    if (session?.isGameOver) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 relative overflow-hidden">
                {/* Background Ambient */}
                <div className="absolute inset-0 bg-radial-gradient from-purple-900/20 via-[#050505] to-black opacity-50" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col md:flex-row gap-8 items-center max-w-4xl w-full relative z-10"
                >
                    {/* Poster Reveal */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="w-full max-w-xs aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative group"
                    >
                        {session?.posterPath ? (
                            <img
                                src={`https://image.tmdb.org/t/p/w780${session.posterPath}`}
                                alt="Movie Poster"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
                                <Film className="w-16 h-16 text-neutral-700" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60" />
                    </motion.div>

                    {/* Stats & Actions */}
                    <div className="flex-1 text-center md:text-left space-y-6">
                        <div>
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="mb-4 inline-block"
                            >
                                <config.Icon className="w-16 h-16 text-white/50 mx-auto md:mx-0" strokeWidth={1} />
                            </motion.div>

                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
                                Game Over
                            </h2>
                            <p className="text-neutral-400 text-lg">
                                The movie was <span className="text-white font-bold">{session.correctAnswer}</span>
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5 backdrop-blur-md">
                                <p className="text-neutral-500 text-xs uppercase tracking-widest mb-1">Total Score</p>
                                <p className="text-3xl font-bold text-white">{session.totalScore || 0}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5 backdrop-blur-md">
                                <p className="text-neutral-500 text-xs uppercase tracking-widest mb-1">Max Streak</p>
                                <div className="flex items-center gap-2 justify-center md:justify-start">
                                    <p className="text-3xl font-bold text-white">{session.streak || 0}</p>
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <button
                                onClick={() => {
                                    resetGame();
                                    setShowModeSelect(true);
                                    setCurrentStage(1);
                                    setLives(3);
                                }}
                                className="btn-primary flex-1 h-12 text-lg"
                            >
                                Play Again
                            </button>
                            <button
                                onClick={() => setShowShareCard(true)}
                                className="btn-secondary flex-1 h-12"
                            >
                                Share Result
                            </button>
                        </div>

                        <Link href="/" className="inline-block text-neutral-500 hover:text-white transition-colors text-sm mt-2">
                            Return to Menu
                        </Link>
                    </div>
                </motion.div>

                {/* Share Card Modal */}
                <AnimatePresence>
                    {showShareCard && (
                        <ShareCard
                            industry={industry}
                            mode={session?.mode || 'classic'}
                            guessedAtStage={guessedAtStage || 3}
                            totalStages={3}
                            streak={session?.streak || 0}
                            score={session?.totalScore || session?.finalScore || 0}
                            movieTitle={session?.correctAnswer}
                            onClose={() => setShowShareCard(false)}
                        />
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // Main Game Screen - Cinematic Spotlights Layout
    return (
        <div className="h-screen flex flex-row overflow-hidden bg-[#0a0a0a] relative selection:bg-white/10">
            {/* Left Sidebar: Vertical Film Strip */}
            <VerticalFilmStrip
                currentStage={currentStage}
                totalStages={3}
                industry={industry}
            />

            {/* Main Content Area */}
            <main className="flex-1 relative flex flex-col min-w-0">
                {/* Background Effects */}
                <CinematicBackground />

                {/* Top HUD */}
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

                {/* Center Stage & Dynamic Content */}
                <div className="flex-1 relative flex items-center justify-center p-4">
                    <AnimatePresence mode="wait">
                        {showCorrectAnimation ? (
                            <motion.div
                                key="correct-overlay"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
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
                                        className="mb-4 relative z-10 drop-shadow-2xl flex justify-center"
                                    >
                                        <PartyPopper className="w-20 h-20 text-yellow-400 mx-auto" strokeWidth={1.5} />
                                    </motion.div>
                                    <p className="text-3xl font-bold text-white tracking-tight mb-2">That's right!</p>
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-neutral-300 text-sm">
                                        <span>+{result?.roundScore || 0} points</span>
                                        {guessedAtStage === 1 && (
                                            <span className="flex items-center gap-1 text-amber-400">
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

                    {/* Feedback / Near Miss Overlay */}
                    {/* Feedback / Near Miss Overlay */}
                    <AnimatePresence>
                        {result && showFeedback && !result.isCorrect && !result.gameOver && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className={`
                                    absolute bottom-32 left-1/2 -translate-x-1/2 z-40
                                    px-6 py-3 rounded-full shadow-2xl border
                                    flex items-center gap-3
                                    ${result.status === "NEAR_MISS"
                                        ? "bg-neutral-900/95 border-amber-500/30 text-amber-500"
                                        : "bg-neutral-900/95 border-red-500/30 text-red-500"
                                    }
                                `}
                            >
                                <div className={`text-xl ${result.status === "NEAR_MISS" ? "text-amber-500" : "text-red-500"}`}>
                                    {result.status === "NEAR_MISS" ?
                                        <Zap className="w-6 h-6 fill-current" /> :
                                        <XCircle className="w-6 h-6" />
                                    }
                                </div>
                                <div>
                                    <p className="font-bold text-xs uppercase tracking-widest">
                                        {result.status === "NEAR_MISS" ? "Close Call" : "Missed"}
                                    </p>
                                    <p className="text-[10px] opacity-60 font-mono mt-0.5 uppercase tracking-wider">{result.message}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Bottom Tactile Console */}
                <div className="relative z-30 p-6 md:p-8">
                    {/* Gradient Fade for seamless blend */}
                    <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black via-black/90 to-transparent -z-10" />

                    <motion.form
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        onSubmit={handleSubmit}
                        className="max-w-2xl mx-auto w-full flex flex-col md:flex-row gap-3 items-stretch shadow-2xl shadow-black/50"
                    >
                        {/* Tactile Input */}
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

                        {/* Shimmer Button */}
                        <button
                            type="submit"
                            disabled={loading || !guess.trim() || showCorrectAnimation}
                            className={`
                                relative overflow-hidden group
                                px-8 h-12 md:h-auto rounded-2xl font-bold text-sm tracking-widest uppercase
                                transition-all duration-300
                                disabled:opacity-50 disabled:cursor-not-allowed
                                ${guess.length >= 3 && !loading
                                    ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95"
                                    : "bg-white/10 text-neutral-400 border border-white/5 hover:bg-white/20"}
                            `}
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {loading ? (
                                    <span className="animate-pulse">Checking...</span>
                                ) : (
                                    <>
                                        Guess
                                        {guess.length >= 3 && <span className="text-lg">↵</span>}
                                    </>
                                )}
                            </span>

                            {/* Shimmer Effect Overlay (Active only) */}
                            {guess.length >= 3 && !loading && (
                                <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer z-0">
                                    <div className="w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg]" />
                                </div>
                            )}
                        </button>
                    </motion.form>

                    {/* Helper text */}
                    <p className="text-center text-neutral-600 text-[10px] mt-3 uppercase tracking-widest hidden md:block">
                        Press Enter to confirm
                    </p>
                </div>
            </main>
        </div>
    );
}
