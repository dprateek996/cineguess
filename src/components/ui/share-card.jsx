"use client";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
    Clapperboard, Check, Download, Clipboard, X
} from "lucide-react";

/**
 * ShareCard - Generates beautiful, simple, Twitter-ready shareable result images.
 */

const stageEmojis = {
    correct: "🟩",
    wrong: "⬛",
    skipped: "⬜",
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

    // Generate stage grid for text share
    const generateStageGrid = () => {
        return Array.from({ length: totalStages }, (_, i) => {
            if (i + 1 < guessedAtStage) return stageEmojis.wrong;
            if (i + 1 === guessedAtStage) return stageEmojis.correct;
            return stageEmojis.skipped;
        }).join("");
    };

    const generateShareText = () => {
        const grid = generateStageGrid();
        const modeLabel = mode === "daily" ? "Daily Challenge" : "CineQuest";

        return `${modeLabel} ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
${industry} Mode

${grid}

${guessedAtStage > totalStages ? "Missed it! 🎬" : `Guessed in ${guessedAtStage} ${guessedAtStage === 1 ? 'try' : 'tries'} 🎯`}

Play at cinequest.vercel.app`;
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(generateShareText());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Copy failed:", err);
        }
    };

    const handleDownload = async () => {
        if (!cardRef.current || typeof window === "undefined") return;
        setIsGenerating(true);
        try {
            const html2canvas = (await import("html2canvas")).default;
            const canvas = await html2canvas(cardRef.current, {
                backgroundColor: null,
                scale: 3,
                logging: false,
                useCORS: true,
            });

            const link = document.createElement("a");
            link.download = `cinequest-result-${Date.now()}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
        } catch (err) {
            console.error("Image generation failed:", err);
        } finally {
            setIsGenerating(false);
        }
    };

    const isWin = guessedAtStage <= totalStages;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-sm flex flex-col gap-6"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 
                  The Visual Card
                  Simple, Clean, Sans-serif, Twitter-ready (approx 1.2:1 aspect ratio)
                */}
                <div className="relative flex justify-center">
                    <div
                        ref={cardRef}
                        className="relative w-full aspect-[1.2/1] bg-neutral-900 rounded-2xl overflow-hidden flex flex-col p-8 border border-white/5 shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-start mb-auto">
                            <div>
                                <h3 className="text-white font-bold text-xl tracking-tight">CineQuest</h3>
                                <p className="text-neutral-500 text-xs font-medium uppercase tracking-widest mt-1">
                                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${isWin ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                                {isWin ? 'SOLVED' : 'MISSED'}
                            </div>
                        </div>

                        {/* Center Content */}
                        <div className="my-8">
                            <p className="text-neutral-500 text-[10px] uppercase tracking-widest mb-2 font-medium">The Movie Was</p>
                            <h2 className="text-3xl md:text-4xl font-black text-white leading-none tracking-tight">
                                {movieTitle}
                            </h2>
                        </div>

                        {/* Footer */}
                        <div className="mt-auto pt-6 border-t border-white/5 flex items-end justify-between">
                            <div>
                                <div className="flex gap-1 mb-2">
                                    {Array.from({ length: totalStages }).map((_, i) => {
                                        let color = "bg-neutral-800";
                                        if (i + 1 < guessedAtStage) color = "bg-neutral-800"; // Wrong/Past
                                        if (i + 1 === guessedAtStage) color = isWin ? "bg-emerald-500" : "bg-red-500";
                                        if (i + 1 > guessedAtStage) color = "bg-neutral-800"; // Future

                                        // Simple boxes
                                        return <div key={i} className={`w-8 h-1.5 rounded-full ${color}`} />
                                    })}
                                </div>
                                <p className="text-neutral-600 text-[10px] font-medium">
                                    {isWin ? `Guessed in ${guessedAtStage}/${totalStages}` : 'Better luck next time'}
                                </p>
                            </div>

                            <Clapperboard className="w-5 h-5 text-neutral-700" />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={handleCopy}
                        className="btn-secondary flex items-center justify-center gap-2 h-12 text-sm font-medium bg-neutral-800/50 border-neutral-700/50 hover:bg-neutral-800 hover:border-neutral-600"
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
                        {copied ? "Copied" : "Copy Text"}
                    </button>
                    <button
                        onClick={handleDownload}
                        disabled={isGenerating}
                        className="btn-primary flex items-center justify-center gap-2 h-12 text-sm font-medium bg-white text-black hover:bg-neutral-200 border-none"
                    >
                        {isGenerating ? (
                            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        ) : (
                            <Download className="w-4 h-4" />
                        )}
                        Save Image
                    </button>
                </div>

                <button
                    onClick={onClose}
                    className="mx-auto text-neutral-500 text-xs hover:text-white transition-colors flex items-center gap-1"
                >
                    <X className="w-3 h-3" /> Close
                </button>
            </motion.div>
        </motion.div>
    );
}
