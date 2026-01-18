"use client";
import { motion } from "framer-motion";

/**
 * FilmStripProgress - Nostalgic film strip stage indicator
 * 
 * Shows 4 frames representing game stages with sprocket holes
 */

const stageConfig = [
    { icon: "🎬", label: "Scene", points: "4x" },
    { icon: "💬", label: "Dialogue", points: "3x" },
    { icon: "💡", label: "Trivia", points: "2x" },
    { icon: "🖼️", label: "Poster", points: "1x" },
];

export default function FilmStripProgress({
    currentStage = 1,
    totalStages = 4,
    industry = "HOLLYWOOD",
    className = ""
}) {
    // Industry-themed glow colors
    const glowColors = {
        HOLLYWOOD: { primary: "#3b82f6", secondary: "#22d3ee" },
        BOLLYWOOD: { primary: "#f97316", secondary: "#fbbf24" },
        ANIME: { primary: "#a855f7", secondary: "#ec4899" },
        GLOBAL: { primary: "#10b981", secondary: "#14b8a6" },
    };

    const colors = glowColors[industry] || glowColors.HOLLYWOOD;

    return (
        <div className={`relative ${className}`}>
            {/* Film strip container */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-neutral-900/80 rounded-lg border border-neutral-800 overflow-hidden"
                style={{
                    boxShadow: `0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)`,
                }}
            >
                {/* Sprocket holes - top */}
                <div className="flex justify-around px-2 py-1.5 bg-neutral-950/60 border-b border-neutral-800/50">
                    {[...Array(8)].map((_, i) => (
                        <div
                            key={`top-${i}`}
                            className="w-2 h-2 rounded-sm bg-neutral-800"
                            style={{
                                boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)",
                            }}
                        />
                    ))}
                </div>

                {/* Frames */}
                <div className="flex items-stretch py-3 px-2 gap-2">
                    {stageConfig.slice(0, totalStages).map((stage, index) => {
                        const stageNum = index + 1;
                        const isPast = stageNum < currentStage;
                        const isCurrent = stageNum === currentStage;
                        const isFuture = stageNum > currentStage;

                        return (
                            <motion.div
                                key={index}
                                className="relative flex-1"
                                initial={false}
                                animate={{
                                    scale: isCurrent ? 1.05 : 1,
                                    y: isCurrent ? -2 : 0,
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            >
                                {/* Frame glow - positioned via layoutId for smooth transitions */}
                                <motion.div
                                    layoutId="stage-glow"
                                    className="absolute -inset-1 rounded-lg blur-md pointer-events-none"
                                    style={{
                                        background: isCurrent
                                            ? `linear-gradient(135deg, ${colors.primary}50, ${colors.secondary}40)`
                                            : 'transparent',
                                        opacity: isCurrent ? 1 : 0,
                                    }}
                                    animate={isCurrent ? {
                                        opacity: [0.6, 1, 0.6],
                                    } : { opacity: 0 }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                />

                                {/* Frame */}
                                <div
                                    className={`
                                        relative flex flex-col items-center justify-center 
                                        p-3 rounded-md border transition-all duration-300
                                        min-w-[70px] aspect-[4/3]
                                        ${isCurrent
                                            ? 'bg-neutral-800/80 border-neutral-600'
                                            : isPast
                                                ? 'bg-neutral-850/50 border-neutral-700/50'
                                                : 'bg-neutral-900/50 border-neutral-800/30'
                                        }
                                    `}
                                    style={isCurrent ? {
                                        boxShadow: `0 0 20px ${colors.primary}30`,
                                    } : {}}
                                >
                                    {/* Stage icon */}
                                    <motion.span
                                        className={`text-xl mb-1 ${isFuture ? 'opacity-40 grayscale' : ''}`}
                                        animate={isCurrent ? {
                                            scale: [1, 1.1, 1],
                                        } : {}}
                                        transition={{
                                            duration: 1.5,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                        }}
                                    >
                                        {stage.icon}
                                    </motion.span>

                                    {/* Label */}
                                    <span className={`text-[10px] uppercase tracking-wider ${isCurrent ? 'text-neutral-300' : 'text-neutral-500'
                                        }`}>
                                        {stage.label}
                                    </span>

                                    {/* Points badge */}
                                    {isCurrent && (
                                        <motion.span
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="absolute -top-2 -right-2 text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                                            style={{
                                                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                                                color: 'white',
                                                boxShadow: `0 2px 8px ${colors.primary}50`,
                                            }}
                                        >
                                            {stage.points}
                                        </motion.span>
                                    )}

                                    {/* Completed checkmark */}
                                    {isPast && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-md"
                                        >
                                            <span className="text-neutral-500 text-lg">✓</span>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Sprocket holes - bottom */}
                <div className="flex justify-around px-2 py-1.5 bg-neutral-950/60 border-t border-neutral-800/50">
                    {[...Array(8)].map((_, i) => (
                        <div
                            key={`bottom-${i}`}
                            className="w-2 h-2 rounded-sm bg-neutral-800"
                            style={{
                                boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)",
                            }}
                        />
                    ))}
                </div>
            </motion.div>

            {/* Stage info text */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-center gap-3 mt-3"
            >
                <span className="text-neutral-500 text-xs uppercase tracking-wider">
                    Stage {currentStage}/{totalStages}
                </span>
                {currentStage >= 3 && (
                    <span className="text-xs text-amber-400/70">
                        {currentStage === 4 ? "🎬 Final clue!" : "⚠️ Points dropping..."}
                    </span>
                )}
            </motion.div>
        </div>
    );
}
