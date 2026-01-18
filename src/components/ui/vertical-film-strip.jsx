"use client";
import { motion } from "framer-motion";
import { Image as ImageIcon, MessageSquareText, Film, Sparkles } from "lucide-react";

/**
 * VerticalFilmStrip - Left sidebar stage indicator
 * "Rolls" vertically like a film reel
 */

const STAGE_CONFIGS = {
    3: [
        { key: "poster", label: "Poster", Icon: ImageIcon },
        { key: "dialogue", label: "Quote", Icon: MessageSquareText },
        { key: "scene", label: "Scene", Icon: Film },
    ],
    4: [
        { key: "poster", label: "Poster", Icon: ImageIcon },
        { key: "dialogue", label: "Quote", Icon: MessageSquareText },
        { key: "emoji", label: "Clue", Icon: Sparkles },
        { key: "scene", label: "Scene", Icon: Film },
    ]
};

export default function VerticalFilmStrip({
    currentStage = 1,
    totalStages = 3,
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
    const stages = STAGE_CONFIGS[totalStages] || STAGE_CONFIGS[3];

    return (
        <div className={`h-full flex flex-col items-center py-6 w-20 bg-black/40 backdrop-blur-xl border-r border-white/5 relative z-30 ${className}`}>
            {/* Film Holes Pattern (Left) - Removed for cleaner look */}

            <div className="flex-1 flex flex-col items-center justify-center relative w-full overflow-hidden">
                {/* Rolling Content */}
                <motion.div
                    className="flex flex-col items-center gap-8 relative"
                    animate={{ y: -(currentStage - 1) * 80 }} // Rolls up by 80px per stage
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                >
                    {stages.map((stage, index) => {
                        const stageNum = index + 1;
                        const isCurrent = stageNum === currentStage;
                        const isPast = stageNum < currentStage;
                        const Icon = stage.Icon;

                        return (
                            <div key={stage.key} className="relative w-full flex justify-center h-[60px]">
                                <motion.div
                                    className={`
                                        relative z-10 flex flex-col items-center justify-center gap-2 p-3 rounded-xl
                                        transition-all duration-300 w-14
                                    `}
                                    animate={{
                                        scale: isCurrent ? 1.1 : 0.8,
                                        opacity: isCurrent ? 1 : isPast ? 0.3 : 0.5,
                                        filter: isCurrent ? 'none' : 'grayscale(100%)'
                                    }}
                                >
                                    {/* Icon */}
                                    <div className={isCurrent ? 'text-white' : 'text-neutral-400'}>
                                        <Icon className="w-5 h-5" strokeWidth={1.5} />
                                    </div>

                                    {/* Label (Only visible if current) */}
                                    {isCurrent && (
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-[9px] uppercase tracking-wider font-medium text-center"
                                            style={{ color: colors.secondary }}
                                        >
                                            {stage.label}
                                        </motion.span>
                                    )}

                                    {/* Active Indicator Glow */}
                                    {isCurrent && (
                                        <motion.div
                                            layoutId="activeGlow"
                                            className="absolute inset-0 rounded-xl -z-10"
                                            style={{
                                                background: `radial-gradient(circle at center, ${colors.primary}40, transparent 70%)`,
                                                boxShadow: `0 0 20px ${colors.primary}20`
                                            }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    )}
                                </motion.div>

                                {/* Connection Line Segment */}
                                {index < stages.length - 1 && (
                                    <div className="absolute top-[50px] w-[1px] h-[30px] bg-white/10 -z-10" />
                                )}
                            </div>
                        );
                    })}
                </motion.div>

                {/* Focusing overlay gradients to fade top/bottom */}
                <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black to-transparent z-20 pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black to-transparent z-20 pointer-events-none" />
            </div>

            {/* Points Badge */}
            <div className="mt-4">
                <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Mult</span>
                    <span className="text-xl font-bold text-white tracking-tighter">
                        {totalStages === 3
                            ? (currentStage === 1 ? '4×' : currentStage === 2 ? '2×' : '1×')
                            : `${(5 - currentStage)}×`
                        }
                    </span>
                </div>
            </div>
        </div>
    );
}
