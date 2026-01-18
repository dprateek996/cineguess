"use client";
import { motion } from "framer-motion";

/**
 * SlimFilmStrip - Elegant minimal stage indicator
 * 
 * Horizontal, slim design with SVG icons (no emojis)
 */

// SVG Icons for each stage
const StageIcons = {
    scene: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M10 9l5 3-5 3V9z" fill="currentColor" stroke="none" />
        </svg>
    ),
    dialogue: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    ),
    trivia: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
        </svg>
    ),
    poster: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
            <path d="M21 15l-5-5L5 21" />
        </svg>
    ),
};

const stages = [
    { key: "scene", label: "Scene", points: "4×" },
    { key: "dialogue", label: "Dialogue", points: "3×" },
    { key: "trivia", label: "Trivia", points: "2×" },
    { key: "poster", label: "Poster", points: "1×" },
];

export default function SlimFilmStrip({
    currentStage = 1,
    industry = "HOLLYWOOD",
    className = "",
}) {
    const industryColors = {
        HOLLYWOOD: { primary: "#3b82f6", secondary: "#22d3ee" },
        BOLLYWOOD: { primary: "#f97316", secondary: "#fbbf24" },
        ANIME: { primary: "#a855f7", secondary: "#ec4899" },
        GLOBAL: { primary: "#10b981", secondary: "#14b8a6" },
    };

    const colors = industryColors[industry] || industryColors.HOLLYWOOD;

    return (
        <div className={`w-full ${className}`}>
            {/* Stage indicator text */}
            <div className="flex items-center justify-center gap-2 mb-3">
                <span className="text-neutral-600 text-[10px] uppercase tracking-widest">
                    Stage {currentStage} of 4
                </span>
                {currentStage >= 3 && (
                    <span className="text-amber-500/60 text-[10px]">
                        {currentStage === 4 ? "Final clue" : "Points dropping"}
                    </span>
                )}
            </div>

            {/* Film strip track */}
            <div className="relative flex items-center justify-center gap-1 px-4">
                {/* Connection line */}
                <div className="absolute inset-x-8 h-px bg-neutral-800 top-1/2 -translate-y-1/2" />

                {stages.map((stage, index) => {
                    const stageNum = index + 1;
                    const isPast = stageNum < currentStage;
                    const isCurrent = stageNum === currentStage;
                    const isFuture = stageNum > currentStage;

                    return (
                        <div key={stage.key} className="relative flex-1 flex justify-center">
                            <motion.div
                                className={`
                                    relative z-10 flex flex-col items-center gap-1.5 px-3 py-2 rounded-lg
                                    transition-all duration-300
                                    ${isCurrent ? 'bg-neutral-900/80' : 'bg-transparent'}
                                `}
                                animate={{
                                    scale: isCurrent ? 1.05 : 1,
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            >
                                {/* Glow for current */}
                                {isCurrent && (
                                    <motion.div
                                        className="absolute inset-0 rounded-lg blur-md -z-10"
                                        style={{
                                            background: `linear-gradient(135deg, ${colors.primary}30, ${colors.secondary}20)`,
                                        }}
                                        animate={{ opacity: [0.5, 0.8, 0.5] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                )}

                                {/* Icon */}
                                <motion.div
                                    className={`
                                        ${isCurrent ? 'text-white' : isPast ? 'text-neutral-600' : 'text-neutral-700'}
                                    `}
                                    animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                    {StageIcons[stage.key]}
                                </motion.div>

                                {/* Label */}
                                <span className={`
                                    text-[9px] uppercase tracking-wider
                                    ${isCurrent ? 'text-neutral-300' : 'text-neutral-600'}
                                `}>
                                    {stage.label}
                                </span>

                                {/* Points badge (current only) */}
                                {isCurrent && (
                                    <motion.span
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute -top-1 -right-1 text-[8px] px-1.5 py-0.5 rounded-full font-medium"
                                        style={{
                                            background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                                            color: 'white',
                                        }}
                                    >
                                        {stage.points}
                                    </motion.span>
                                )}

                                {/* Completed dot */}
                                {isPast && (
                                    <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-neutral-600" />
                                )}
                            </motion.div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
