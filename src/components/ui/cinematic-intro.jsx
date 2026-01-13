"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function VideoPortal({ children }) {
    const [stage, setStage] = useState("GATE"); // GATE -> CINEMA -> DASHBOARD
    const videoRef = useRef(null);

    // Single click unlocks audio and starts everything
    const handleUnlock = () => {
        setStage("CINEMA");
        if (videoRef.current) {
            videoRef.current.muted = false; // Unmute for sound
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(() => {
                // Fallback: play muted if audio still blocked
                videoRef.current.muted = true;
                videoRef.current.play();
            });
        }
    };

    // Handle video end
    const handleVideoEnd = () => {
        setStage("DASHBOARD");
    };

    return (
        <div className="fixed inset-0 w-screen h-screen bg-black overflow-hidden">
            {/* ========================================
          THE VIDEO
          ======================================== */}
            <motion.div
                className="absolute inset-0 z-10"
                animate={{
                    scale: stage === "DASHBOARD" ? 1.8 : 1,
                    opacity: stage === "DASHBOARD" ? 0 : stage === "GATE" ? 0.3 : 1,
                }}
                transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
            >
                <video
                    ref={videoRef}
                    className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2"
                    style={{
                        filter: stage === "GATE"
                            ? "grayscale(100%) brightness(0.3) blur(5px)"
                            : "grayscale(100%) contrast(1.1) brightness(0.85)",
                        transition: "filter 0.8s ease-out",
                    }}
                    muted
                    playsInline
                    preload="auto"
                    onEnded={handleVideoEnd}
                >
                    <source src="/assets/Old_movie_intro_HD_1080p.mp4" type="video/mp4" />
                </video>

                {/* Vignette */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: "radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.6) 100%)",
                    }}
                />
            </motion.div>

            {/* ========================================
          MINIMAL GATE - Just text, very subtle
          ======================================== */}
            <AnimatePresence>
                {stage === "GATE" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-0 z-50 flex items-center justify-center cursor-pointer"
                        onClick={handleUnlock}
                    >
                        <motion.div
                            className="text-center"
                            initial={{ y: 10 }}
                            animate={{ y: 0 }}
                        >
                            <p className="text-neutral-400 text-sm tracking-[0.2em] uppercase">
                                Click anywhere to enter
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ========================================
          LIGHT BURST
          ======================================== */}
            <AnimatePresence>
                {stage === "DASHBOARD" && (
                    <motion.div
                        className="absolute inset-0 z-20 pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.3, 0] }}
                        transition={{ duration: 1 }}
                        style={{
                            background: "radial-gradient(circle at center, rgba(255,250,240,0.25) 0%, transparent 50%)",
                        }}
                    />
                )}
            </AnimatePresence>

            {/* ========================================
          DASHBOARD
          ======================================== */}
            <motion.div
                className="relative z-30 w-full h-full overflow-auto"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={
                    stage === "DASHBOARD"
                        ? { opacity: 1, scale: 1 }
                        : { opacity: 0, scale: 0.95 }
                }
                transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
                {children}
            </motion.div>
        </div>
    );
}
