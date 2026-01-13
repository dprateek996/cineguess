"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function GameIntro({ onComplete, industry }) {
    const [phase, setPhase] = useState("PLAYING");
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().catch(() => { });
        }
    }, []);

    const handleVideoEnd = () => {
        setPhase("TRANSITION");
        setTimeout(() => {
            setPhase("DONE");
            onComplete();
        }, 600);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (phase === "PLAYING") handleVideoEnd();
        }, 6000);
        return () => clearTimeout(timer);
    }, [phase]);

    const colors = {
        BOLLYWOOD: { from: "#f97316", to: "#eab308", glow: "rgba(249,115,22,0.25)" },
        HOLLYWOOD: { from: "#3b82f6", to: "#22d3ee", glow: "rgba(59,130,246,0.25)" },
        ANIME: { from: "#a855f7", to: "#ec4899", glow: "rgba(168,85,247,0.25)" },
        GLOBAL: { from: "#10b981", to: "#14b8a6", glow: "rgba(16,185,129,0.25)" },
    }[industry] || { from: "#3b82f6", to: "#22d3ee", glow: "rgba(59,130,246,0.25)" };

    return (
        <AnimatePresence>
            {phase !== "DONE" && (
                <motion.div
                    className="fixed inset-0 z-[100] bg-black overflow-hidden"
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    {/* Video */}
                    <motion.div
                        className="absolute inset-0"
                        animate={phase === "TRANSITION" ? { scale: 1.3, opacity: 0 } : { scale: 1, opacity: 1 }}
                        transition={{ duration: 0.6 }}
                    >
                        <video
                            ref={videoRef}
                            className="absolute inset-0 w-full h-full object-cover"
                            style={{ filter: "grayscale(100%) contrast(1.1) brightness(0.7)" }}
                            muted
                            playsInline
                            autoPlay
                            onEnded={handleVideoEnd}
                        >
                            <source src="/assets/Old_movie_intro_HD_1080p.mp4" type="video/mp4" />
                        </video>
                        <div
                            className="absolute inset-0"
                            style={{ background: "radial-gradient(ellipse, transparent 30%, rgba(0,0,0,0.7) 100%)" }}
                        />
                    </motion.div>

                    {/* Center Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                        {/* Glow behind text */}
                        <motion.div
                            className="absolute w-[300px] h-[150px] rounded-full blur-[80px]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.6 }}
                            transition={{ delay: 0.3, duration: 1 }}
                            style={{ background: colors.glow }}
                        />

                        <motion.p
                            className="text-neutral-500 text-xs uppercase tracking-[0.3em] mb-4 relative z-10"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            Get Ready
                        </motion.p>

                        <motion.h1
                            className="text-5xl md:text-6xl font-display font-bold relative z-10"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, duration: 0.6 }}
                            style={{
                                background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                filter: `drop-shadow(0 4px 20px ${colors.glow})`,
                            }}
                        >
                            {industry}
                        </motion.h1>

                        {/* Progress bar */}
                        <motion.div
                            className="absolute bottom-16 left-1/2 -translate-x-1/2 w-32 h-[2px] bg-white/10 rounded-full overflow-hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            style={{
                                boxShadow: "0 0 10px rgba(255,255,255,0.05)",
                            }}
                        >
                            <motion.div
                                className="h-full rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 5, ease: "linear" }}
                                style={{
                                    background: `linear-gradient(90deg, ${colors.from}, ${colors.to})`,
                                    boxShadow: `0 0 8px ${colors.glow}`,
                                }}
                            />
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
