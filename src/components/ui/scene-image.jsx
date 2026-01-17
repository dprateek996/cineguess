"use client";
import { motion } from "framer-motion";
import { useState } from "react";

/**
 * SceneImage - Full cinematic backdrop display for Stage 1
 * 
 * Features:
 * - Full, unblurred scene image from movie backdrop
 * - Cinematic aspect ratio with vignette
 * - Subtle zoom animation on load
 */
export default function SceneImage({
    backdropPath,
    alt = "Movie Scene",
    className = ""
}) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    // TMDB backdrop URL (w1280 for high quality)
    const imageUrl = backdropPath
        ? `https://image.tmdb.org/t/p/w1280${backdropPath}`
        : null;

    if (!imageUrl || imageError) {
        return (
            <div className={`relative aspect-video max-w-3xl mx-auto rounded-2xl overflow-hidden ${className}`}>
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
                    <div className="text-center">
                        <span className="text-5xl mb-4 block">🎬</span>
                        <p className="text-neutral-500 text-sm">Scene unavailable</p>
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
            className={`relative aspect-video max-w-3xl mx-auto rounded-2xl overflow-hidden ${className}`}
        >
            {/* Loading state */}
            {!imageLoaded && (
                <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-8 h-8 border-2 border-neutral-700 border-t-amber-500 rounded-full"
                    />
                </div>
            )}

            {/* The scene image */}
            <motion.img
                src={imageUrl}
                alt={alt}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{
                    scale: imageLoaded ? 1 : 1.1,
                    opacity: imageLoaded ? 1 : 0
                }}
                transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Cinematic vignette overlay */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: `
                        radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%),
                        linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 30%)
                    `
                }}
            />

            {/* Subtle film border */}
            <div className="absolute inset-0 pointer-events-none rounded-2xl ring-1 ring-white/10" />

            {/* Stage label */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm"
            >
                <span className="text-sm">🎬</span>
                <span className="text-xs text-neutral-300 uppercase tracking-wider">Scene Clue</span>
            </motion.div>
        </motion.div>
    );
}
