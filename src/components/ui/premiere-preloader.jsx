"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PremierePreloader({ onComplete }) {
    const [stage, setStage] = useState("intro"); // intro -> countdown -> reveal -> done
    const [countdown, setCountdown] = useState(5);
    const videoRef = useRef(null);

    // Handle user interaction to start the experience
    const handleStart = () => {
        setStage("countdown");
        if (videoRef.current) {
            videoRef.current.play().catch(console.log);
        }
    };

    // Handle video end - transition to curtain reveal
    const handleVideoEnd = () => {
        setStage("reveal");
    };

    // Fallback countdown timer
    useEffect(() => {
        if (stage === "countdown") {
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setStage("reveal");
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [stage]);

    return (
        <AnimatePresence>
            {stage !== "done" && (
                <motion.div
                    className="fixed inset-0 z-[999] bg-black flex items-center justify-center overflow-hidden"
                    exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeOut" } }}
                >
                    {/* ========================================
              STAGE 1: CLICK TO ENTER
              ======================================== */}
                    <AnimatePresence>
                        {stage === "intro" && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, scale: 1.1, transition: { duration: 0.5 } }}
                                className="absolute inset-0 z-50 flex flex-col items-center justify-center cursor-pointer bg-gradient-radial from-neutral-900 via-black to-black"
                                onClick={handleStart}
                            >
                                {/* Spotlight Effect */}
                                <div className="absolute inset-0 overflow-hidden">
                                    <motion.div
                                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
                                        style={{
                                            background: "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)",
                                        }}
                                        animate={{
                                            scale: [1, 1.2, 1],
                                            opacity: [0.5, 0.8, 0.5],
                                        }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    />
                                </div>

                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3, duration: 0.8 }}
                                    className="relative z-10 text-center"
                                >
                                    {/* Cinema Logo */}
                                    <motion.div
                                        className="relative mb-8"
                                        animate={{ rotateY: [0, 10, -10, 0] }}
                                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                    >
                                        <span className="text-7xl md:text-8xl filter drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                                            🎬
                                        </span>
                                    </motion.div>

                                    {/* Title */}
                                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-b from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent">
                                        CineGuess
                                    </h1>

                                    <p className="text-neutral-500 text-lg mb-10 tracking-wide">
                                        A Cinematic Experience
                                    </p>

                                    {/* Enter Button */}
                                    <motion.div
                                        className="relative"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <motion.div
                                            className="absolute -inset-4 rounded-full bg-gradient-to-r from-orange-500/20 via-amber-500/20 to-orange-500/20 blur-xl"
                                            animate={{ opacity: [0.3, 0.6, 0.3] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        />
                                        <div className="relative w-20 h-20 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center mx-auto cursor-pointer group">
                                            <motion.div
                                                className="w-0 h-0 border-l-[16px] border-l-white border-y-[10px] border-y-transparent ml-1 group-hover:border-l-amber-400 transition-colors"
                                                animate={{ x: [0, 2, 0] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                            />
                                        </div>
                                        <p className="text-neutral-400 text-sm mt-4">Click to Enter</p>
                                    </motion.div>
                                </motion.div>

                                {/* Decorative Film Strip */}
                                <div className="absolute bottom-0 left-0 right-0 h-20 overflow-hidden opacity-10">
                                    <motion.div
                                        className="flex"
                                        animate={{ x: [0, -200] }}
                                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                    >
                                        {[...Array(20)].map((_, i) => (
                                            <div key={i} className="flex-shrink-0 w-20 h-20 border border-white/30 mr-2" />
                                        ))}
                                    </motion.div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ========================================
              STAGE 2: VINTAGE COUNTDOWN
              ======================================== */}
                    {stage === "countdown" && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-10 flex items-center justify-center"
                        >
                            {/* Video Background */}
                            <video
                                ref={videoRef}
                                autoPlay
                                muted
                                playsInline
                                onEnded={handleVideoEnd}
                                className="absolute inset-0 w-full h-full object-cover grayscale contrast-125 brightness-90"
                            >
                                <source src="/assets/Old_movie_intro_HD_1080p.mp4" type="video/mp4" />
                            </video>

                            {/* Vignette Overlay */}
                            <div
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                    background: "radial-gradient(circle at 50% 50%, transparent 30%, rgba(0,0,0,0.7) 100%)",
                                }}
                            />

                            {/* Scratch Lines Effect */}
                            <div className="absolute inset-0 pointer-events-none opacity-30">
                                <motion.div
                                    className="absolute top-0 left-1/4 w-px h-full bg-white/20"
                                    animate={{ x: [0, 100, 0], opacity: [0, 0.5, 0] }}
                                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                                />
                                <motion.div
                                    className="absolute top-0 right-1/3 w-px h-full bg-white/20"
                                    animate={{ x: [0, -50, 0], opacity: [0, 0.3, 0] }}
                                    transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 3, delay: 1 }}
                                />
                            </div>

                            {/* Film Grain Overlay */}
                            <motion.div
                                className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay"
                                animate={{ opacity: [0.15, 0.25, 0.15] }}
                                transition={{ duration: 0.1, repeat: Infinity }}
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                                }}
                            />
                        </motion.div>
                    )}

                    {/* ========================================
              POLISHED VELVET CURTAINS
              ======================================== */}
                    <div className="absolute inset-0 flex z-20 pointer-events-none">
                        {/* Left Curtain */}
                        <motion.div
                            initial={{ x: 0 }}
                            animate={
                                stage === "reveal"
                                    ? {
                                        x: "-100%",
                                        skewY: -2,
                                        transition: {
                                            duration: 2.2,
                                            ease: [0.22, 1, 0.36, 1],
                                        },
                                    }
                                    : { x: 0 }
                            }
                            className="w-1/2 h-full relative"
                            style={{
                                background: "linear-gradient(to left, #1a1a1a, #0d0d0d 40%, #050505)",
                                boxShadow: "20px 0 100px rgba(0,0,0,0.95)",
                            }}
                        >
                            {/* Velvet Fold Highlight */}
                            <div
                                className="absolute inset-0"
                                style={{
                                    backgroundImage: `
                    radial-gradient(ellipse at 100% 50%, rgba(255,255,255,0.04) 0%, transparent 50%),
                    repeating-linear-gradient(90deg, transparent 0px, transparent 60px, rgba(255,255,255,0.015) 60px, rgba(255,255,255,0.015) 62px)
                  `,
                                }}
                            />
                            {/* Edge Light */}
                            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-neutral-800/30 to-transparent" />
                            {/* Gold Trim */}
                            <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-900/40 via-amber-600/20 to-amber-900/40" />
                        </motion.div>

                        {/* Right Curtain */}
                        <motion.div
                            initial={{ x: 0 }}
                            animate={
                                stage === "reveal"
                                    ? {
                                        x: "100%",
                                        skewY: 2,
                                        transition: {
                                            duration: 2.2,
                                            ease: [0.22, 1, 0.36, 1],
                                        },
                                    }
                                    : { x: 0 }
                            }
                            onAnimationComplete={() => {
                                if (stage === "reveal") {
                                    // Add dramatic pause before revealing content
                                    setTimeout(() => {
                                        onComplete();
                                        setStage("done");
                                    }, 300);
                                }
                            }}
                            className="w-1/2 h-full relative"
                            style={{
                                background: "linear-gradient(to right, #1a1a1a, #0d0d0d 40%, #050505)",
                                boxShadow: "-20px 0 100px rgba(0,0,0,0.95)",
                            }}
                        >
                            {/* Velvet Fold Highlight */}
                            <div
                                className="absolute inset-0"
                                style={{
                                    backgroundImage: `
                    radial-gradient(ellipse at 0% 50%, rgba(255,255,255,0.04) 0%, transparent 50%),
                    repeating-linear-gradient(90deg, transparent 0px, transparent 60px, rgba(255,255,255,0.015) 60px, rgba(255,255,255,0.015) 62px)
                  `,
                                }}
                            />
                            {/* Edge Light */}
                            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-neutral-800/30 to-transparent" />
                            {/* Gold Trim */}
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-900/40 via-amber-600/20 to-amber-900/40" />
                        </motion.div>
                    </div>

                    {/* ========================================
              TOP CURTAIN VALANCE
              ======================================== */}
                    <motion.div
                        className="absolute top-0 left-0 right-0 h-16 z-30"
                        initial={{ opacity: 1 }}
                        animate={stage === "reveal" ? { opacity: 0, y: -20 } : { opacity: 1 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        style={{
                            background: "linear-gradient(to bottom, #1a1a1a, transparent)",
                        }}
                    >
                        {/* Curtain Rod Effect */}
                        <div className="absolute top-4 left-0 right-0 h-3 bg-gradient-to-r from-amber-900/30 via-amber-700/50 to-amber-900/30 blur-sm" />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
