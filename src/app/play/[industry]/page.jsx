"use client";
import { useEffect, useState, use, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/hooks/useGame";
import { useSound } from "@/hooks/useSound";
import { AnimatedGradient } from "@/components/ui/animated-gradient";
import GameIntro from "@/components/ui/game-intro";
import HandleModal from "@/components/ui/handle-modal";
import SceneImage from "@/components/ui/scene-image";
import TypewriterDialogue from "@/components/ui/typewriter-dialogue";
import EmojiClue from "@/components/ui/emoji-clue";
import StageTransition from "@/components/ui/stage-transition";
import StageIndicator from "@/components/ui/stage-indicator";
import SoundToggle from "@/components/ui/sound-toggle";
import AutocompleteInput from "@/components/ui/autocomplete-input";
import ShareCard from "@/components/ui/share-card";
import ScoreCounter from "@/components/ui/score-counter";
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
    GLOBAL: {
        name: "Global",
        gradient: "from-emerald-500 to-teal-400",
        glow: "rgba(16, 185, 129, 0.3)",
        icon: "🌍",
        confettiColors: ["#10b981", "#14b8a6", "#22c55e", "#a3e635"],
    },
};

export default function PlayPage({ params }) {
    const { industry } = use(params);
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
    const timerRef = useRef(null);

    const config = industryConfig[industry] || industryConfig.HOLLYWOOD;

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
        // On timeout, advance to next stage instead of losing a life
        if (currentStage < 4) {
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
        } else {
            // At Stage 4, timeout = lose a life
            setLives(prevLives => {
                const newLives = prevLives - 1;
                if (newLives <= 0) {
                    endGame('timeout');
                } else {
                    setTimeLeft(session?.timeLimit || 30);
                }
                return newLives;
            });
            loseLife();
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

                // Wrong guess → advance to next stage (not lose life)
                if (currentStage < 4) {
                    playTransition();  // Stage transition sound
                    setCurrentStage(prev => prev + 1);
                } else {
                    // At final stage, wrong guess = game over (classic) or lose life (rapid fire)
                    if (session?.mode === 'rapidfire') {
                        setLives(prevLives => {
                            const newLives = prevLives - 1;
                            if (newLives <= 0) {
                                playGameOver();
                                endGame('lives');
                            }
                            return newLives;
                        });
                        loseLife();
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
            case 'emoji':
                return (
                    <EmojiClue
                        emojis={stageInfo.data.emojis}
                    />
                );
            case 'poster':
                return (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative aspect-[2/3] max-w-sm mx-auto rounded-2xl overflow-hidden glass"
                        style={{ boxShadow: `0 0 60px ${config.glow}` }}
                    >
                        {session?.posterPath ? (
                            <motion.img
                                key={session.posterPath}
                                src={`https://image.tmdb.org/t/p/w500${session.posterPath}`}
                                alt="Movie Poster"
                                className="absolute inset-0 w-full h-full object-cover"
                                style={{
                                    filter: `blur(${stageInfo.data.blurAmount || 25}px)`,
                                    transform: 'scale(1.15)',
                                }}
                            />
                        ) : (
                            <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-30`} />
                        )}
                        <div className="absolute inset-0 bg-black/10" />
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

    // Show intro first
    if (showIntro) {
        return <GameIntro onComplete={handleIntroComplete} industry={industry} />;
    }

    // Mode selection
    if (showModeSelect) {
        return (
            <AnimatedGradient className="min-h-screen flex items-center justify-center px-4">
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
                            className="glass rounded-2xl p-6 text-left border border-neutral-700/50 hover:border-neutral-600 transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-4xl">🎯</span>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Classic Endless</h3>
                                    <p className="text-neutral-400 text-sm">4 stages of clues. Guess at any stage for bonus points!</p>
                                </div>
                            </div>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => startGame('rapidfire')}
                            className="glass rounded-2xl p-6 text-left border border-neutral-700/50 hover:border-red-500/50 transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-4xl">⚡</span>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Rapid Fire</h3>
                                    <p className="text-neutral-400 text-sm">Beat the clock! 3 lives. Speed bonuses.</p>
                                </div>
                            </div>
                        </motion.button>
                    </div>

                    <Link href="/" className="inline-block mt-6 text-neutral-500 hover:text-white transition-colors">
                        ← Back to Menu
                    </Link>
                </motion.div>
            </AnimatedGradient>
        );
    }

    // Handle modal
    if (showHandleModal) {
        return (
            <AnimatedGradient className="min-h-screen">
                <HandleModal isOpen={true} onSubmit={handleHandleSubmit} />
            </AnimatedGradient>
        );
    }

    // Loading state
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

    // Error state
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
                    <Link href="/" className="btn-primary">Go Back</Link>
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
                        {(session.streak || 0) >= 5 ? "🏆" : "🎬"}
                    </motion.div>

                    <h2 className={`text-3xl font-bold mb-4 bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>
                        Game Over!
                    </h2>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="glass rounded-xl p-4">
                            <p className="text-neutral-400 text-sm">Streak</p>
                            <p className="text-3xl font-bold text-white">{session.streak || 0}</p>
                        </div>
                        <div className="glass rounded-xl p-4">
                            <p className="text-neutral-400 text-sm">Score</p>
                            <p className="text-3xl font-bold text-white">{session.totalScore || session.finalScore || 0}</p>
                        </div>
                    </div>

                    {session.correctAnswer && (
                        <p className="text-neutral-400 mb-6">
                            The movie was: <span className="text-white font-semibold">{session.correctAnswer}</span>
                        </p>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={() => setShowShareCard(true)}
                            className="btn-secondary flex items-center justify-center gap-2"
                        >
                            📤 Share Results
                        </button>
                        <button
                            onClick={() => {
                                resetGame();
                                setShowModeSelect(true);
                                setCurrentStage(1);
                                setLives(3);
                            }}
                            className="btn-primary"
                        >
                            Play Again
                        </button>
                        <Link href="/" className="btn-secondary">
                            Change Category
                        </Link>
                    </div>
                </motion.div>

                {/* Share Card Modal */}
                <AnimatePresence>
                    {showShareCard && (
                        <ShareCard
                            industry={industry}
                            mode={session?.mode || 'classic'}
                            guessedAtStage={guessedAtStage || 4}
                            totalStages={4}
                            streak={session?.streak || 0}
                            score={session?.totalScore || session?.finalScore || 0}
                            movieTitle={session?.correctAnswer}
                            onClose={() => setShowShareCard(false)}
                        />
                    )}
                </AnimatePresence>
            </AnimatedGradient>
        );
    }

    // Main Game Screen
    return (
        <AnimatedGradient className="min-h-screen">
            <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-6"
                >
                    <div className="flex items-center gap-3">
                        <Link href="/" className="text-neutral-400 hover:text-white transition-colors">
                            ← Exit
                        </Link>
                        <SoundToggle isMuted={isMuted} onToggle={toggleMute} />
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Lives for Rapid Fire */}
                        {session?.mode === 'rapidfire' && (
                            <div className="flex gap-1">
                                {[...Array(3)].map((_, i) => (
                                    <motion.span
                                        key={i}
                                        animate={i === lives - 1 && lives < 3 ? { scale: [1, 1.3, 1] } : {}}
                                        className={`text-xl ${i < lives ? 'opacity-100' : 'opacity-30'}`}
                                    >
                                        ❤️
                                    </motion.span>
                                ))}
                            </div>
                        )}
                        {/* Animated Score Counter */}
                        <ScoreCounter score={session?.totalScore || 0} />
                    </div>
                </motion.div>

                {/* Round & Mode Info */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-center mb-6"
                >
                    <p className="text-neutral-500 text-sm uppercase tracking-wider">
                        {session?.mode === 'rapidfire' ? '⚡ Rapid Fire' : '🎯 Classic'} • Round {session?.currentRound || 1}
                    </p>
                    {(session?.streak || 0) > 0 && (
                        <p className="text-orange-400 text-sm">🔥 {session.streak} movie streak!</p>
                    )}
                </motion.div>

                {/* Timer for Rapid Fire */}
                {session?.mode === 'rapidfire' && timeLeft !== null && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center mb-6"
                    >
                        <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full ${timeLeft <= 10 ? 'bg-red-500/20' : 'glass'}`}>
                            <span className={`text-3xl font-bold ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                                {timeLeft}s
                            </span>
                        </div>
                    </motion.div>
                )}

                {/* Correct Animation Overlay */}
                <AnimatePresence>
                    {showCorrectAnimation && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="text-center"
                            >
                                <div className="text-8xl mb-4">🎉</div>
                                <p className="text-3xl font-bold text-white">Correct!</p>
                                <p className="text-neutral-300">+{result?.roundScore || 0} points</p>
                                {guessedAtStage === 1 && (
                                    <p className="text-amber-400 text-sm mt-2">🏆 First try bonus!</p>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Stage Content with Transition */}
                <StageTransition stage={currentStage}>
                    <div className="mb-6">
                        {getStageContent()}
                    </div>
                </StageTransition>

                {/* Stage Indicator */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-6"
                >
                    <StageIndicator
                        currentStage={currentStage}
                        totalStages={4}
                    />
                </motion.div>

                {/* Result Feedback */}
                <AnimatePresence>
                    {result && !result.isCorrect && !result.gameOver && (
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
                            {currentStage < 4 && (
                                <span className="block text-sm mt-1 text-neutral-400">
                                    Advancing to next clue...
                                </span>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Guess Input with Autocomplete */}
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
                        disabled={loading || showCorrectAnimation}
                        shakeOnError={shakeInput}
                        className="flex-1"
                    />
                    <button
                        type="submit"
                        disabled={loading || !guess.trim() || showCorrectAnimation}
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "..." : "Guess"}
                    </button>
                </motion.form>
            </div>
        </AnimatedGradient>
    );
}
