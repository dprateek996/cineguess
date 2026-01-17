"use client";
import { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";

/**
 * ShareCard - Generates shareable result images (Wordle-style)
 * 
 * Features:
 * - Stage grid visualization (🟩🟩⬛⬛)
 * - Copy to clipboard
 * - Twitter share with pre-formatted text
 * - Download as image
 */

const stageEmojis = {
    correct: "🟩",
    wrong: "⬛",
    skipped: "⬜",
};

const categoryIcons = {
    BOLLYWOOD: "🎭",
    HOLLYWOOD: "🎬",
    ANIME: "⛩️",
    GLOBAL: "🌍",
};

export default function ShareCard({
    industry = "HOLLYWOOD",
    mode = "classic",
    guessedAtStage = 1,
    totalStages = 4,
    streak = 0,
    score = 0,
    movieTitle = "",
    onClose,
}) {
    const cardRef = useRef(null);
    const [copied, setCopied] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    // Generate stage grid (🟩🟩⬛⬛)
    const generateStageGrid = () => {
        return Array.from({ length: totalStages }, (_, i) => {
            if (i + 1 < guessedAtStage) return stageEmojis.wrong;
            if (i + 1 === guessedAtStage) return stageEmojis.correct;
            return stageEmojis.skipped;
        }).join("");
    };

    // Generate share text
    const generateShareText = () => {
        const icon = categoryIcons[industry] || "🎬";
        const grid = generateStageGrid();
        const modeLabel = mode === "rapidfire" ? "⚡ Rapid Fire" : "🎯 Classic";

        return `CineGuess ${icon} ${modeLabel}

${grid}

${guessedAtStage === 1 ? "🏆 First try!" : `Guessed in Stage ${guessedAtStage}`}
Score: ${score} | Streak: ${streak}

Play at cineguess.vercel.app #CineGuess`;
    };

    // Copy to clipboard
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(generateShareText());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Copy failed:", err);
        }
    };

    // Share to Twitter
    const handleTwitterShare = () => {
        const text = encodeURIComponent(generateShareText());
        const url = `https://twitter.com/intent/tweet?text=${text}`;
        window.open(url, "_blank", "width=550,height=420");
    };

    // Download as image
    const handleDownload = async () => {
        if (!cardRef.current || typeof window === "undefined") return;

        setIsGenerating(true);
        try {
            const html2canvas = (await import("html2canvas")).default;
            const canvas = await html2canvas(cardRef.current, {
                backgroundColor: "#0a0a0a",
                scale: 2,
            });

            const link = document.createElement("a");
            link.download = `cineguess-${Date.now()}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
        } catch (err) {
            console.error("Image generation failed:", err);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                className="w-full max-w-sm"
                onClick={(e) => e.stopPropagation()}
            >
                {/* The shareable card */}
                <div
                    ref={cardRef}
                    className="rounded-2xl p-6 mb-4"
                    style={{
                        background: "linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)",
                        border: "1px solid rgba(255,255,255,0.1)",
                    }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">{categoryIcons[industry]}</span>
                            <div>
                                <h3 className="text-white font-bold text-lg">CineGuess</h3>
                                <p className="text-neutral-500 text-xs">
                                    {mode === "rapidfire" ? "⚡ Rapid Fire" : "🎯 Classic"} Mode
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-amber-400 font-bold text-xl">{score}</p>
                            <p className="text-neutral-500 text-xs">points</p>
                        </div>
                    </div>

                    {/* Stage Grid */}
                    <div className="text-center mb-4">
                        <div className="text-4xl tracking-widest mb-2">
                            {generateStageGrid()}
                        </div>
                        <p className="text-neutral-400 text-sm">
                            {guessedAtStage === 1 ? (
                                <span className="text-amber-400">🏆 First try!</span>
                            ) : (
                                `Guessed in Stage ${guessedAtStage}`
                            )}
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="rounded-lg bg-neutral-800/50 p-3 text-center">
                            <p className="text-white font-bold text-xl">{streak}</p>
                            <p className="text-neutral-500 text-xs">Streak</p>
                        </div>
                        <div className="rounded-lg bg-neutral-800/50 p-3 text-center">
                            <p className="text-white font-bold text-xl">
                                {guessedAtStage}x
                            </p>
                            <p className="text-neutral-500 text-xs">Multiplier</p>
                        </div>
                    </div>

                    {/* Movie revealed */}
                    {movieTitle && (
                        <p className="text-center text-neutral-500 text-sm">
                            The movie was: <span className="text-white font-semibold">{movieTitle}</span>
                        </p>
                    )}

                    {/* Footer */}
                    <div className="mt-4 pt-4 border-t border-neutral-800 text-center">
                        <p className="text-neutral-600 text-xs">cineguess.vercel.app</p>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={handleCopy}
                        className="flex-1 py-3 px-4 rounded-xl glass border border-neutral-700 hover:border-neutral-600 text-white font-medium text-sm transition-all"
                    >
                        {copied ? "✓ Copied!" : "📋 Copy"}
                    </button>
                    <button
                        onClick={handleTwitterShare}
                        className="flex-1 py-3 px-4 rounded-xl bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white font-medium text-sm transition-all"
                    >
                        𝕏 Share
                    </button>
                    <button
                        onClick={handleDownload}
                        disabled={isGenerating}
                        className="py-3 px-4 rounded-xl glass border border-neutral-700 hover:border-neutral-600 text-white text-sm transition-all disabled:opacity-50"
                    >
                        {isGenerating ? "..." : "📥"}
                    </button>
                </div>

                {/* Close hint */}
                <p className="text-center text-neutral-600 text-xs mt-3">
                    Tap outside to close
                </p>
            </motion.div>
        </motion.div>
    );
}
