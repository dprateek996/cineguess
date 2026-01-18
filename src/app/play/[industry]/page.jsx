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
import SlimFilmStrip from "@/components/ui/slim-film-strip";
import AutocompleteInput from "@/components/ui/autocomplete-input";
import ShareCard from "@/components/ui/share-card";
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
            case 'trivia':
                return (
                    <TriviaCard
                        trivia={stageInfo.data.trivia}
                        industry={industry}
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
                    className="text-center relative z-10"
                >
                    <div className="text-5xl mb-4 animate-bounce">{config.icon}</div>
                    <p className="text-neutral-400">Loading {config.name} challenge...</p>
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
                    className="text-center glass rounded-2xl p-8 max-w-md relative z-10"
                >
                    <div className="text-5xl mb-4">😢</div>
                    <h2 className="text-xl font-bold text-white mb-2">Oops!</h2>
                    <p className="text-neutral-400 mb-6">{error}</p>
                    <Link href="/" className="btn-primary">Go Back</Link>
                </motion.div>
            </div>
        );
    }

    // Game Over Screen
    if (session?.isGameOver) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 relative overflow-hidden">
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: "radial-gradient(ellipse at 50% 0%, rgba(30,30,40,0.5) 0%, transparent 70%)",
                    }}
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center glass rounded-3xl p-10 max-w-lg w-full relative z-10"
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
            </div>
        );
    }

    // Main Game Screen - Cinematic Spotlights Layout
    return (
        <div className="h-screen flex flex-col overflow-hidden bg-[#0a0a0a] relative selection:bg-white/10">
            {/* Spotlight Gradient - Matches Landing Page */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse at 50% 0%, rgba(30,30,40,0.5) 0%, transparent 70%)",
                }}
            />

            {/* Ambient Industry Tint - Very subtle at bottom */}
            <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                    background: `linear-gradient(to top, ${config.glow} 0%, transparent 30%)`,
                }}
            />

            {/* Minimal HUD - Top */}
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

            {/* Correct Animation Overlay */}
            <AnimatePresence>
                {showCorrectAnimation && (
                    <motion.div
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
                                className="text-8xl mb-6 relative z-10 drop-shadow-2xl"
                            >
                                🎉
                            </motion.div>
                            <p className="text-3xl font-bold text-white tracking-tight mb-2">That's right!</p>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-neutral-300 text-sm">
                                <span>+{result?.roundScore || 0} points</span>
                                {guessedAtStage === 1 && <span className="text-amber-400">★ Perfect</span>}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col justify-center items-center px-6 relative z-10 w-full max-w-7xl mx-auto">
                {/* Stage Content with Transition */}
                <StageTransition stage={currentStage}>
                    <div className="w-full max-w-5xl mx-auto">
                        <div className="relative group">
                            {/* Content Frame */}
                            {getStageContent()}
                        </div>
                    </div>
                </StageTransition>

                {/* Result Feedback - Floating pill */}
                <AnimatePresence>
                    {result && !result.isCorrect && !result.gameOver && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`
                                absolute bottom-24 left-1/2 -translate-x-1/2 z-30
                                px-6 py-3 rounded-xl text-sm font-medium backdrop-blur-md shadow-2xl
                                flex items-center gap-2
                                ${result.status === "NEAR_MISS"
                                    ? "bg-amber-950/40 text-amber-200 border border-amber-500/20"
                                    : "bg-red-950/40 text-red-200 border border-red-500/20"
                                }
                            `}
                        >
                            <span className="text-lg">{result.status === "NEAR_MISS" ? "🤏" : "❌"}</span>
                            {result.message}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Controls - Unified Bar */}
            <div className="relative z-20 px-6 pb-8 pt-4">
                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Slim Film Strip */}
                    <SlimFilmStrip
                        currentStage={currentStage}
                        industry={industry}
                        className="opacity-80 hover:opacity-100 transition-opacity"
                    />

                    {/* Guess Input - Matching Landing Page Input Style */}
                    <motion.form
                        onSubmit={handleSubmit}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="relative z-30"
                    >
                        <div className="flex gap-2 p-1.5 rounded-2xl bg-neutral-900/80 border border-neutral-800/80 shadow-2xl backdrop-blur-xl">
                            <AutocompleteInput
                                value={guess}
                                onChange={(e) => setGuess(e.target.value)}
                                onSubmit={handleSubmit}
                                placeholder="Type movie title..."
                                industry={industry}
                                disabled={loading || showCorrectAnimation}
                                shakeOnError={shakeInput}
                                className="flex-1 bg-transparent border-none text-white placeholder:text-neutral-600 focus:ring-0 h-11 px-3"
                            />
                            <button
                                type="submit"
                                disabled={loading || !guess.trim() || showCorrectAnimation}
                                className={`
                                    px-6 h-11 rounded-xl font-medium text-sm text-white tracking-wide
                                    transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                                    hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]
                                    bg-gradient-to-r ${config.gradient}
                                `}
                                style={{
                                    boxShadow: `0 0 15px ${config.glow}`,
                                }}
                            >
                                {loading ? "..." : "Guess"}
                            </button>
                        </div>
                    </motion.form>
                </div>
            </div>
        </div>
    );
}
