"use client";
import { useState, useCallback } from "react";

export function useGame() {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    const initGame = useCallback(async (industry, mode = 'classic') => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await fetch("/api/game/init", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ industry, mode }),
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.error || "Failed to start game");
            }

            setSession(data.data);
            return data.data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const submitGuess = useCallback(async (guess, currentStage = 1, timeRemaining = null) => {
        if (!session?.sessionId) {
            throw new Error("No active session");
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/game/guess", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId: session.sessionId,
                    guess,
                    currentStage,
                    timeRemaining,
                }),
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.error || "Failed to submit guess");
            }

            const guessResult = data.data;
            setResult(guessResult);

            if (guessResult.isCorrect && guessResult.nextMovie) {
                // Correct! Update session with next movie and reset to Stage 1
                setSession(prev => ({
                    ...prev,
                    currentRound: guessResult.currentRound,
                    currentStage: 1,  // Reset to Stage 1 for new movie
                    streak: guessResult.streak,
                    totalScore: guessResult.totalScore,
                    hints: guessResult.nextMovie.hints,
                    stageData: guessResult.nextMovie.stageData,
                    allStages: guessResult.nextMovie.allStages,
                    blurAmount: guessResult.nextMovie.blurAmount,
                    timeLimit: guessResult.nextMovie.timeLimit,
                    posterPath: guessResult.nextMovie.posterPath,
                    backdropPath: guessResult.nextMovie.backdropPath,
                }));
            } else if (guessResult.gameOver) {
                // Game Over
                setSession(prev => ({
                    ...prev,
                    isGameOver: true,
                    finalScore: guessResult.finalScore,
                    streak: guessResult.streak,
                    correctAnswer: guessResult.correctAnswer,
                }));
            }

            return guessResult;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [session]);

    const endGame = useCallback(async (reason = 'lives') => {
        if (!session?.sessionId) return;

        try {
            const res = await fetch("/api/game/guess", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: 'end',
                    sessionId: session.sessionId,
                    reason,
                }),
            });

            const data = await res.json();
            if (data.success) {
                setSession(prev => ({
                    ...prev,
                    isGameOver: true,
                    finalScore: data.data.finalScore,
                    streak: data.data.streak,
                    correctAnswer: data.data.correctAnswer,
                }));
            }
            return data.data;
        } catch (err) {
            console.error('End game error:', err);
        }
    }, [session]);

    const resetGame = useCallback(() => {
        setSession(null);
        setResult(null);
        setError(null);
    }, []);

    // Helper to lose a life in rapid fire mode
    const loseLife = useCallback(() => {
        setSession(prev => {
            if (!prev || prev.mode !== 'rapidfire') return prev;
            const newLives = (prev.lives || 3) - 1;
            return { ...prev, lives: newLives };
        });
    }, []);

    return {
        session,
        loading,
        error,
        result,
        initGame,
        submitGuess,
        endGame,
        resetGame,
        loseLife,
    };
}
