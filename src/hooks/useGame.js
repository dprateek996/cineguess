"use client";
import { useState, useCallback } from "react";

export function useGame() {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    const initGame = useCallback(async (industry) => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await fetch("/api/game/init", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ industry, mode: "infinite" }),
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

    const submitGuess = useCallback(async (guess) => {
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
                    guess
                }),
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.error || "Failed to submit guess");
            }

            const guessResult = data.data;
            setResult(guessResult);

            // Update session with new data
            if (!guessResult.gameOver) {
                setSession(prev => ({
                    ...prev,
                    currentLevel: guessResult.currentLevel || prev.currentLevel,
                    attempts: (prev.attempts || 0) + 1,
                    hint: guessResult.nextHint || prev.hint,
                }));
            } else {
                setSession(prev => ({
                    ...prev,
                    isGameOver: true,
                    isWon: guessResult.isCorrect,
                    score: guessResult.score,
                    correctAnswer: guessResult.message?.match(/"([^"]+)"/)?.[1],
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

    const resetGame = useCallback(() => {
        setSession(null);
        setResult(null);
        setError(null);
    }, []);

    return {
        session,
        loading,
        error,
        result,
        initGame,
        submitGuess,
        resetGame,
    };
}
