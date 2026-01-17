"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * ScoreCounter - Animated score display with slot machine effect
 * 
 * Features:
 * - Rolling number animation on score change
 * - Points popup on score increase
 * - Glow effect on increase
 */
export default function ScoreCounter({
    score = 0,
    label = "Score",
    className = ""
}) {
    const [displayScore, setDisplayScore] = useState(score);
    const [isAnimating, setIsAnimating] = useState(false);
    const [scoreDiff, setScoreDiff] = useState(0);
    const prevScoreRef = useRef(score);

    useEffect(() => {
        if (score !== prevScoreRef.current) {
            const diff = score - prevScoreRef.current;
            setScoreDiff(diff);
            setIsAnimating(true);

            // Animate the number rolling
            const duration = 500;
            const startTime = Date.now();
            const startValue = displayScore;
            const endValue = score;

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Easing function
                const eased = 1 - Math.pow(1 - progress, 3);

                const currentValue = Math.floor(startValue + (endValue - startValue) * eased);
                setDisplayScore(currentValue);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    setDisplayScore(score);
                    setTimeout(() => setIsAnimating(false), 500);
                }
            };

            requestAnimationFrame(animate);
            prevScoreRef.current = score;
        }
    }, [score, displayScore]);

    // Format number with commas
    const formatNumber = (num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    return (
        <div className={`relative ${className}`}>
            <motion.div
                animate={isAnimating ? {
                    scale: [1, 1.05, 1],
                    boxShadow: [
                        "0 0 0px rgba(251, 191, 36, 0)",
                        "0 0 20px rgba(251, 191, 36, 0.4)",
                        "0 0 0px rgba(251, 191, 36, 0)"
                    ]
                } : {}}
                transition={{ duration: 0.5 }}
                className="glass px-4 py-2 rounded-full"
            >
                <span className="text-neutral-400 text-sm">{label}: </span>
                <motion.span
                    className="text-white font-bold"
                    animate={isAnimating ? { color: ["#fff", "#fbbf24", "#fff"] } : {}}
                    transition={{ duration: 0.5 }}
                >
                    {formatNumber(displayScore)}
                </motion.span>
            </motion.div>

            {/* Points popup */}
            <AnimatePresence>
                {isAnimating && scoreDiff > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 0, scale: 0.5 }}
                        animate={{ opacity: 1, y: -30, scale: 1 }}
                        exit={{ opacity: 0, y: -50 }}
                        transition={{ duration: 0.6 }}
                        className="absolute left-1/2 -translate-x-1/2 top-0 pointer-events-none"
                    >
                        <span className="text-amber-400 font-bold text-lg drop-shadow-lg">
                            +{formatNumber(scoreDiff)}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
