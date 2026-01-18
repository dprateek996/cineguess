"use client";
import { motion } from "framer-motion";
import { useState } from "react";

/**
 * SceneImage - Cinematic backdrop display for Stage 1
 * 
 * Features:
 * - Letterbox bars (10% top/bottom) for cinematic ratio
 * - Film grain overlay for authentic look
 * - Heavy vignette + slight desaturation
 * - Slow Ken Burns zoom/pan effect
 */
export default function SceneImage({
    backdropPath,
    alt = "Movie Scene",
    className = ""
}) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const imageUrl = backdropPath
        ? `https://image.tmdb.org/t/p/w1280${backdropPath}`
        : null;

    if (!imageUrl || imageError) {
        return (
            <div className={`relative w-full max-w-4xl mx-auto ${className}`}>
                <div className="relative aspect-[2.35/1] bg-neutral-950 rounded-lg overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-neutral-800/50 flex items-center justify-center">
                                <svg className="w-6 h-6 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <p className="text-neutral-600 text-xs tracking-wide">Scene unavailable</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`relative w-full max-w-4xl mx-auto ${className}`}
        >
            {/* Container with cinematic aspect ratio */}
            <div className="relative aspect-[2.35/1] bg-black rounded-lg overflow-hidden shadow-2xl shadow-black/50">

                {/* Loading state */}
                {!imageLoaded && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-neutral-950">
                        <motion.div
                            className="relative w-10 h-10"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                            <svg viewBox="0 0 24 24" className="w-full h-full text-neutral-700">
                                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
                                <path
                                    d="M12 2a10 10 0 0 1 10 10"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    className="text-amber-500/70"
                                />
                            </svg>
                        </motion.div>
                    </div>
                )}

                {/* The scene image with slow Ken Burns */}
                <motion.img
                    src={imageUrl}
                    alt={alt}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                    initial={{ scale: 1.15, opacity: 0 }}
                    animate={{
                        scale: imageLoaded ? [1.0, 1.06] : 1.15,
                        opacity: imageLoaded ? 1 : 0,
                        x: imageLoaded ? [0, 15] : 0,
                    }}
                    transition={{
                        scale: { duration: 20, ease: "linear", repeat: Infinity, repeatType: "reverse" },
                        x: { duration: 25, ease: "linear", repeat: Infinity, repeatType: "reverse" },
                        opacity: { duration: 1.2, ease: "easeOut" },
                    }}
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{
                        filter: "saturate(0.85) contrast(1.05)",
                    }}
                />

                {/* Letterbox bars - top */}
                <div
                    className="absolute top-0 left-0 right-0 z-20 bg-black"
                    style={{ height: "8%" }}
                />

                {/* Letterbox bars - bottom */}
                <div
                    className="absolute bottom-0 left-0 right-0 z-20 bg-black"
                    style={{ height: "8%" }}
                />

                {/* Heavy vignette overlay */}
                <div
                    className="absolute inset-0 z-10 pointer-events-none"
                    style={{
                        background: `
                            radial-gradient(ellipse 80% 60% at 50% 50%, transparent 20%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.85) 100%)
                        `
                    }}
                />

                {/* Film grain overlay */}
                <div
                    className="absolute inset-0 z-10 pointer-events-none opacity-[0.04] mix-blend-overlay"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    }}
                />

                {/* Subtle warm tint for filmic look */}
                <div
                    className="absolute inset-0 z-10 pointer-events-none opacity-[0.08]"
                    style={{
                        background: "linear-gradient(180deg, rgba(255,200,150,0.1) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)"
                    }}
                />

                {/* Film scratch lines (very subtle) */}
                <motion.div
                    className="absolute inset-0 z-10 pointer-events-none overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.03, 0] }}
                    transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 3 }}
                >
                    <div
                        className="absolute top-0 bottom-0 w-px bg-white/40"
                        style={{ left: `${Math.random() * 100}%` }}
                    />
                </motion.div>

                {/* Inner shadow frame */}
                <div className="absolute inset-0 z-20 pointer-events-none rounded-lg ring-1 ring-inset ring-white/5" />

                {/* Outer glow border */}
                <div
                    className="absolute -inset-px z-0 rounded-lg opacity-40"
                    style={{
                        background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)"
                    }}
                />
            </div>

            {/* Stage label - bottom left, inside the frame */}
            <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute bottom-[12%] left-4 z-30 flex items-center gap-2 px-3 py-1.5 rounded bg-black/70 backdrop-blur-sm border border-white/5"
            >
                <svg className="w-3.5 h-3.5 text-amber-500/80" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                </svg>
                <span className="text-[10px] text-neutral-400 uppercase tracking-[0.15em] font-medium">Scene</span>
            </motion.div>
        </motion.div>
    );
}
