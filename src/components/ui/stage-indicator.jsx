"use client";
import { motion } from "framer-motion";

/**
 * StageIndicator - Visual progress indicator for hint stages
 * 
 * Shows current stage (1-4) with icons and points multiplier
 */

const stageConfig = [
    { icon: "🎬", label: "Scene", points: "4x" },
    { icon: "💬", label: "Dialogue", points: "3x" },
    { icon: "🎭", label: "Emojis", points: "2x" },
    { icon: "🖼️", label: "Poster", points: "1x" },
];

export default function StageIndicator({
    currentStage = 1,
    totalStages = 4,
    className = ""
}) {
    const currentConfig = stageConfig[currentStage - 1] || stageConfig[0];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col items-center gap-3 ${className}`}
        >
            {/* Current stage info */}
            <div className="flex items-center gap-2 text-sm">
                <span className="text-lg">{currentConfig.icon}</span>
                <span className="text-neutral-400 uppercase tracking-wider text-xs">
                    Stage {currentStage}/{totalStages}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-medium">
                    {currentConfig.points} Points
                </span>
            </div>

            {/* Progress dots */}
            <div className="flex items-center gap-2">
                {Array.from({ length: totalStages }).map((_, index) => {
                    const stageNum = index + 1;
                    const isPast = stageNum < currentStage;
                    const isCurrent = stageNum === currentStage;
                    const isFuture = stageNum > currentStage;

                    return (
                        <motion.div
                            key={index}
                            className="relative"
                            initial={false}
                            animate={{
                                scale: isCurrent ? 1.2 : 1,
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                            {/* Glow for current */}
                            {isCurrent && (
                                <motion.div
                                    animate={{
                                        scale: [1, 1.5, 1],
                                        opacity: [0.5, 0.2, 0.5]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className="absolute inset-0 rounded-full bg-amber-400 blur-sm"
                                />
                            )}

                            {/* The dot */}
                            <div
                                className={`
                                    relative w-3 h-3 rounded-full transition-colors duration-300
                                    ${isCurrent ? 'bg-amber-400 ring-2 ring-amber-400/30' : ''}
                                    ${isPast ? 'bg-neutral-600' : ''}
                                    ${isFuture ? 'bg-neutral-800 ring-1 ring-neutral-700' : ''}
                                `}
                            />

                            {/* Connector line */}
                            {index < totalStages - 1 && (
                                <div
                                    className={`
                                        absolute top-1/2 left-full w-2 h-[2px] -translate-y-1/2
                                        ${isPast ? 'bg-neutral-600' : 'bg-neutral-800'}
                                    `}
                                />
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Warning for later stages */}
            {currentStage >= 3 && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-neutral-500 mt-1"
                >
                    {currentStage === 4 ? "Final clue!" : "Points dropping..."}
                </motion.p>
            )}
        </motion.div>
    );
}
