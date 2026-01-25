"use client";
import { motion } from "framer-motion";
import { Skull, Popcorn, Film, Trophy, Crown } from "lucide-react";
import { Icons } from "@/components/Icons";
import { FilmGrain } from "@/components/ui/film-grain";
import { BorderBeam } from "@/components/ui/border-beam";

// Tier configuration based on movies guessed correctly
const getTierInfo = (moviesCorrect) => {
    if (moviesCorrect >= 15) {
        return {
            tier: 5,
            title: "THE AUTEUR",
            tagline: "Complete creative control. You don't follow the script—you rewrite the entire industry.",
            icon: Crown,
            emoji: "👑",
            colors: {
                primary: "oklch(90% 0.12 90)", // Electric Gold / Diamond White
                glow: "rgba(255, 215, 0, 0.4)",
                gradient: "from-amber-100 via-yellow-200 to-amber-100",
                bg: "bg-gradient-to-br from-amber-500/20 via-yellow-400/10 to-amber-500/20",
                border: "border-amber-300/40",
                ring: "ring-amber-300/50",
            },
            isPrestige: true,
        };
    }
    if (moviesCorrect >= 10) {
        return {
            tier: 4,
            title: "CINEMA LEGEND",
            tagline: "Wait... did you direct these? You don't just watch movies; you live in the frame.",
            icon: Trophy,
            emoji: "🏆",
            colors: {
                primary: "#fbbf24",
                glow: "rgba(251, 191, 36, 0.3)",
                gradient: "from-amber-200 via-yellow-100 to-amber-200",
                bg: "bg-amber-500/10",
                border: "border-amber-500/30",
                ring: "ring-amber-500/30",
            },
            isPrestige: false,
        };
    }
    if (moviesCorrect >= 5) {
        return {
            tier: 3,
            title: "MOVIE BUFF",
            tagline: "You know enough to be dangerous. A few more hits and we might give you a chair with your name on it.",
            icon: Film,
            emoji: "🎥",
            colors: {
                primary: "#60a5fa",
                glow: "rgba(96, 165, 250, 0.3)",
                gradient: "from-blue-300 via-sky-200 to-blue-300",
                bg: "bg-blue-500/10",
                border: "border-blue-500/30",
                ring: "ring-blue-500/30",
            },
            isPrestige: false,
        };
    }
    if (moviesCorrect >= 2) {
        return {
            tier: 2,
            title: "CASUAL VIEWER",
            tagline: "You're here for the snacks, not the plot. Average, but at least you're comfortable.",
            icon: Popcorn,
            emoji: "🎟️",
            colors: {
                primary: "#a3a3a3",
                glow: "rgba(163, 163, 163, 0.2)",
                gradient: "from-zinc-300 via-zinc-200 to-zinc-300",
                bg: "bg-zinc-500/10",
                border: "border-zinc-500/30",
                ring: "ring-zinc-500/30",
            },
            isPrestige: false,
        };
    }
    return {
        tier: 0,
        title: "DELETED SCENE",
        tagline: "You were so bad for the pacing, we cut you from the final edit. Try a different hobby.",
        icon: Skull,
        emoji: "💀",
        colors: {
            primary: "#ef4444",
            glow: "rgba(239, 68, 68, 0.2)",
            gradient: "from-red-400 via-red-300 to-red-400",
            bg: "bg-red-500/10",
            border: "border-red-500/30",
            ring: "ring-red-500/30",
        },
        isPrestige: false,
    };
};

export default function RapidFireGameOver({
    moviesCorrect = 0,
    totalScore = 0,
    posterPath,
    backdropPath,
    lastMovie,
    industry = "hollywood",
    onPlayAgain,
    onReturnToMenu,
}) {
    const tier = getTierInfo(moviesCorrect);
    const TierIcon = tier.icon;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                when: "beforeChildren",
                staggerChildren: 0.12,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 25 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 300, damping: 24 },
        },
    };

    // Glitch animation for prestige tier
    const glitchVariants = {
        animate: {
            x: [0, -2, 2, -1, 1, 0],
            filter: [
                "hue-rotate(0deg)",
                "hue-rotate(10deg)",
                "hue-rotate(-10deg)",
                "hue-rotate(5deg)",
                "hue-rotate(0deg)",
            ],
        },
    };

    // Build share URL
    const origin = typeof window !== "undefined" ? window.location.origin : "https://cinequest.com";
    const shareText = `${tier.emoji} I achieved ${tier.title} in CineQuest Rapid Fire!\n\n🎬 ${moviesCorrect} movies guessed\n⚡ ${totalScore} points\n\nCan you beat my score? #CineQuest`;
    const sharePageUrl = `${origin}/share?mode=RapidFire&score=${totalScore}&rank=${encodeURIComponent(tier.title)}&movies=${moviesCorrect}`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(sharePageUrl)}`;

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden font-sans selection:bg-red-500/30">
            {/* Cinematic Backdrop */}
            {backdropPath && (
                <div className="absolute inset-0 z-0">
                    <motion.div
                        initial={{ opacity: 0, scale: 1.2 }}
                        animate={{ opacity: 1, scale: 1.1 }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        className="w-full h-full relative"
                    >
                        <img
                            src={`https://image.tmdb.org/t/p/original${backdropPath}`}
                            alt="Background"
                            className="w-full h-full object-cover opacity-15 blur-2xl"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-black/70" />
                    </motion.div>
                </div>
            )}
            <FilmGrain />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-md relative z-10"
            >
                {/* Main Card */}
                <div
                    className={`relative bg-zinc-900/70 backdrop-blur-2xl border ${tier.colors.border} rounded-[2rem] overflow-hidden shadow-2xl ring-1 ${tier.colors.ring}`}
                >
                    {/* Border Beam for Prestige Tier */}
                    {tier.isPrestige && (
                        <BorderBeam
                            size={300}
                            duration={8}
                            colorFrom="#ffd700"
                            colorTo="#fff8dc"
                            borderWidth={2}
                        />
                    )}

                    {/* Header - Tier Badge */}
                    <motion.div
                        variants={itemVariants}
                        className={`relative px-6 py-6 text-center border-b border-white/5 ${tier.colors.bg}`}
                    >
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                        {/* Tier Icon */}
                        <motion.div
                            className="inline-flex items-center justify-center mb-3"
                            animate={tier.isPrestige ? glitchVariants.animate : {}}
                            transition={tier.isPrestige ? { duration: 0.3, repeat: Infinity, repeatDelay: 3 } : {}}
                        >
                            <div
                                className={`p-4 rounded-2xl ${tier.colors.bg} ring-2 ${tier.colors.ring}`}
                                style={{ boxShadow: `0 0 30px ${tier.colors.glow}` }}
                            >
                                <TierIcon className="w-8 h-8" style={{ color: tier.colors.primary }} />
                            </div>
                        </motion.div>

                        <p className="text-[9px] uppercase tracking-[0.3em] text-white/40 font-medium mb-1">
                            Rapid Fire Rank
                        </p>

                        {/* Title with Glow */}
                        <motion.h2
                            className={`text-2xl sm:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r ${tier.colors.gradient}`}
                            style={{
                                textShadow: tier.isPrestige ? `0 0 30px ${tier.colors.glow}` : undefined,
                            }}
                            animate={tier.isPrestige ? glitchVariants.animate : {}}
                            transition={tier.isPrestige ? { duration: 0.2, repeat: Infinity, repeatDelay: 4 } : {}}
                        >
                            {tier.title}
                        </motion.h2>

                        {/* Tagline */}
                        <motion.p
                            variants={itemVariants}
                            className="mt-3 text-xs text-white/50 leading-relaxed max-w-xs mx-auto italic"
                        >
                            "{tier.tagline}"
                        </motion.p>
                    </motion.div>

                    {/* Stats Section */}
                    <div className="p-6 pt-5 flex flex-col items-center">
                        {/* Movies Correct - Hero Stat */}
                        <motion.div variants={itemVariants} className="text-center mb-5">
                            <p className="text-[9px] uppercase tracking-[0.25em] text-white/40 mb-1">
                                Movies Identified
                            </p>
                            <p
                                className="text-5xl font-black tabular-nums"
                                style={{ color: tier.colors.primary }}
                            >
                                {moviesCorrect}
                            </p>
                        </motion.div>

                        {/* Score Display */}
                        <motion.div
                            variants={itemVariants}
                            className="w-full rounded-xl p-4 text-center border border-white/5 bg-white/[0.02] mb-5"
                        >
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <Icons.RapidFire className="w-4 h-4 text-red-500" />
                                <p className="text-[9px] uppercase tracking-widest text-white/40">
                                    Total Score
                                </p>
                            </div>
                            <p className="text-3xl font-bold text-white tabular-nums tracking-tight">
                                {totalScore.toLocaleString()}
                            </p>
                        </motion.div>

                        {/* Last Movie (if any guessed) */}
                        {lastMovie && posterPath && (
                            <motion.div
                                variants={itemVariants}
                                className="flex items-center gap-3 w-full p-3 rounded-xl bg-white/[0.02] border border-white/5 mb-5"
                            >
                                <div className="w-12 aspect-[2/3] rounded-md overflow-hidden ring-1 ring-white/10 flex-shrink-0">
                                    <img
                                        src={`https://image.tmdb.org/t/p/w200${posterPath}`}
                                        alt={lastMovie}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="text-left">
                                    <p className="text-[9px] uppercase tracking-widest text-white/40 mb-0.5">
                                        Last Movie
                                    </p>
                                    <p className="text-sm font-semibold text-white leading-tight">
                                        {lastMovie}
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* Actions */}
                        <motion.div variants={itemVariants} className="flex flex-col w-full gap-2">
                            <a
                                href={shareUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full h-11 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 hover:border-sky-500/40 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all"
                            >
                                Share Result
                            </a>

                            <button
                                onClick={onPlayAgain}
                                className="flex items-center justify-center gap-2 w-full h-11 bg-red-500 hover:bg-red-400 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all shadow-[0_0_20px_-5px_rgba(239,68,68,0.5)] hover:shadow-[0_0_30px_-5px_rgba(239,68,68,0.6)] hover:scale-[1.02]"
                            >
                                <Icons.RapidFire className="w-3 h-3" /> Play Again
                            </button>
                        </motion.div>
                    </div>
                </div>

                {/* Return Link */}
                <motion.button
                    variants={itemVariants}
                    onClick={onReturnToMenu}
                    className="w-full mt-4 group relative px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    <span className="text-xs font-bold uppercase tracking-widest">Return to Menu</span>
                </motion.button>
            </motion.div>
        </div>
    );
}
