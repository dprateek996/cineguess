"use client";
import { motion } from "framer-motion";
import { useState } from "react";

/**
 * SceneImage - "Living Frame" for Stage 1
 * 
 * Features:
 * - Breathing opacity (98-100%) "Living Frame"
 * - Soft glow border bleeding into background
 * - Heavy Vignette for focus
 * - Film grain overlay 
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
                <div className="relative aspect-[2.35/1] bg-neutral-900/50 rounded-xl overflow-hidden border border-white/5 flex items-center justify-center">
                    <p className="text-neutral-600 text-xs tracking-wide">Scene unavailable</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`relative w-full max-w-4xl mx-auto group ${className}`}
        >
            {/* Soft Glow bleeding into background */}
            <div
                className="absolute -inset-4 bg-gradient-to-t from-transparent to-white/5 rounded-3xl blur-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"
            />

            {/* Container with cinematic aspect ratio */}
            <div className="relative aspect-[2.35/1] bg-black rounded-lg overflow-hidden shadow-2xl shadow-black ring-1 ring-white/5">

                {/* Loading state */}
                {!imageLoaded && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-neutral-950">
                        <div className="w-8 h-8 rounded-full border-2 border-neutral-800 border-t-amber-500 animate-spin" />
                    </div>
                )}

                {/* The "Living" Image */}
                <motion.img
                    src={imageUrl}
                    alt={alt}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                    initial={{ scale: 1.15, opacity: 0 }}
                    animate={{
                        scale: imageLoaded ? [1.0, 1.05] : 1.15, // Slow breathing zoom
                        opacity: imageLoaded ? [0.96, 1, 0.96] : 0, // Projector flicker/breath
                    }}
                    transition={{
                        scale: { duration: 20, ease: "linear", repeat: Infinity, repeatType: "reverse" },
                        opacity: { duration: 4, ease: "easeInOut", repeat: Infinity },
                    }}
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{
                        filter: "saturate(0.9) contrast(1.1)", // Cinematic grade
                    }}
                />

                {/* Film Grain Overlay */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-[0.05] mix-blend-overlay"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    }}
                />

                {/* Cinematic Letterbox Bars - Increased to 15% to hide potential titles */}
                <div className="absolute top-0 left-0 right-0 h-[15%] bg-gradient-to-b from-black via-black to-transparent z-10" />
                <div className="absolute bottom-0 left-0 right-0 h-[25%] bg-gradient-to-t from-black via-black/90 to-transparent z-10" />

                {/* Vignette (Inner Shadow) */}
                <div className="absolute inset-0 z-20 pointer-events-none shadow-[inset_0_0_120px_rgba(0,0,0,0.9)]" />
            </div>
        </motion.div>
    );
}
