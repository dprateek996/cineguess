"use client";
import { motion } from "framer-motion";
import Link from "next/link";

/**
 * MinimalHUD - Thin glass top bar for cinematic game UI
 * 
 * Contains: Exit, Sound toggle, Mode/Round, Score, Lives, Timer ring
 */

// SVG Icons for clean look
const SoundOnIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 5L6 9H2v6h4l5 4V5z" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
);

const SoundOffIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 5L6 9H2v6h4l5 4V5z" />
        <line x1="23" y1="9" x2="17" y2="15" />
        <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
);

// Timer Ring Component
function TimerRing({ timeLeft, maxTime = 30, color = "#3b82f6", warning = false }) {
    const radius = 16;
    const circumference = 2 * Math.PI * radius;
    const progress = (timeLeft / maxTime) * circumference;

    return (
        <div className="relative w-10 h-10 flex items-center justify-center">
            <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
                {/* Background circle */}
                <circle
                    cx="20" cy="20" r={radius}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="3"
                    fill="none"
                />
                {/* Progress circle */}
                <motion.circle
                    cx="20" cy="20" r={radius}
                    stroke={warning ? "#ef4444" : color}
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - progress}
                    animate={warning ? { opacity: [1, 0.5, 1] } : {}}
                    transition={warning ? { duration: 0.5, repeat: Infinity } : {}}
                />
            </svg>
            <span className={`absolute text-xs font-medium ${warning ? 'text-red-400' : 'text-white'}`}>
                {timeLeft}
            </span>
        </div>
    );
}

// Tiny glowing heart for lives
function LivesIndicator({ lives, maxLives = 3 }) {
    return (
        <div className="flex gap-1">
            {[...Array(maxLives)].map((_, i) => (
                <motion.div
                    key={i}
                    className={`w-2 h-2 rounded-full ${i < lives ? 'bg-red-500' : 'bg-neutral-700'}`}
                    style={i < lives ? {
                        boxShadow: '0 0 6px rgba(239, 68, 68, 0.6)',
                    } : {}}
                    animate={i === lives - 1 && lives < maxLives ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 0.5 }}
                />
            ))}
        </div>
    );
}

export default function MinimalHUD({
    mode = "classic",
    round = 1,
    score = 0,
    lives = 3,
    timeLeft = null,
    maxTime = 30,
    isMuted = false,
    onToggleMute,
    industry = "HOLLYWOOD",
    streak = 0,
}) {
    const industryColors = {
        HOLLYWOOD: "#3b82f6",
        BOLLYWOOD: "#f97316",
        ANIME: "#a855f7",
        GLOBAL: "#10b981",
    };

    const color = industryColors[industry] || industryColors.HOLLYWOOD;
    const isRapidFire = mode === "rapidfire";
    const warning = timeLeft !== null && timeLeft <= 10;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between px-4 py-2 bg-black/30 backdrop-blur-sm border-b border-white/5"
        >
            {/* Left: Exit + Sound */}
            <div className="flex items-center gap-4">
                <Link
                    href="/"
                    className="text-neutral-500 hover:text-white text-sm transition-colors"
                >
                    ← Exit
                </Link>
                <button
                    onClick={onToggleMute}
                    className="text-neutral-500 hover:text-white transition-colors p-1"
                    title={isMuted ? "Unmute" : "Mute"}
                >
                    {isMuted ? <SoundOffIcon /> : <SoundOnIcon />}
                </button>
            </div>

            {/* Center: Mode + Round */}
            <div className="text-center">
                <p className="text-neutral-500 text-xs uppercase tracking-widest">
                    {isRapidFire ? "Rapid Fire" : "Classic"} • Round {round}
                </p>
                {streak > 0 && (
                    <p className="text-amber-500/70 text-[10px] tracking-wide">
                        {streak} streak
                    </p>
                )}
            </div>

            {/* Right: Score + Lives + Timer */}
            <div className="flex items-center gap-4">
                {/* Score */}
                <div className="text-right">
                    <motion.span
                        key={score}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        className="text-white font-medium text-sm"
                    >
                        {score.toLocaleString()}
                    </motion.span>
                    <span className="text-neutral-600 text-[10px] ml-1">pts</span>
                </div>

                {/* Lives (Rapid Fire only) */}
                {isRapidFire && <LivesIndicator lives={lives} />}

                {/* Timer Ring (Rapid Fire only) */}
                {isRapidFire && timeLeft !== null && (
                    <TimerRing
                        timeLeft={timeLeft}
                        maxTime={maxTime}
                        color={color}
                        warning={warning}
                    />
                )}
            </div>
        </motion.div>
    );
}
