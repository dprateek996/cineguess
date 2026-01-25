"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * RapidFireScene - Full-screen immersive movie scene component
 * Features progressive blur (4px → 0px over 12 seconds)
 */
export default function RapidFireScene({
    backdropPath,
    timeLeft,
    maxTime = 15,
    onImageLoad,
    className = "",
}) {
    const [currentBlur, setCurrentBlur] = useState(4);
    const [imageLoaded, setImageLoaded] = useState(false);
    const startTimeRef = useRef(null);
    const animationRef = useRef(null);

    // Progressive blur animation: 4px → 0px over 12 seconds
    useEffect(() => {
        if (!timeLeft || timeLeft <= 0) return;

        // Reset blur on new scene
        if (timeLeft === maxTime) {
            setCurrentBlur(4);
            startTimeRef.current = Date.now();
        }

        // Animate blur reduction
        const animate = () => {
            if (!startTimeRef.current) return;

            const elapsed = (Date.now() - startTimeRef.current) / 1000;
            const blurProgress = Math.min(elapsed / 12, 1); // 12 seconds to fully clear
            const newBlur = 4 * (1 - blurProgress);

            setCurrentBlur(Math.max(0, newBlur));

            if (blurProgress < 1 && timeLeft > 0) {
                animationRef.current = requestAnimationFrame(animate);
            }
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [timeLeft, maxTime]);

    // Reset when backdrop changes (new movie)
    useEffect(() => {
        setCurrentBlur(4);
        setImageLoaded(false);
        startTimeRef.current = Date.now();
    }, [backdropPath]);

    const handleImageLoad = () => {
        setImageLoaded(true);
        onImageLoad?.();
    };

    // Timer urgency styling
    const isUrgent = timeLeft <= 5;
    const timerProgress = timeLeft / maxTime;

    return (
        <div className={`relative w-full h-full overflow-hidden ${className}`}>
            {/* Movie Scene Image */}
            {/* Movie Scene Image */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={backdropPath}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="absolute inset-0"
                >
                    {backdropPath ? (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-950">
                            <img
                                src={`https://image.tmdb.org/t/p/original${backdropPath}`}
                                alt="Movie Scene"
                                className="max-w-full max-h-full object-contain md:object-cover md:w-full md:h-full transition-[filter] duration-300"
                                style={{
                                    filter: `blur(${currentBlur}px)`,
                                    transform: "scale(1.05)",
                                }}
                                onLoad={handleImageLoad}
                            />
                        </div>
                    ) : (
                        <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                            <p className="text-white/40 text-xl">Loading scene...</p>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Cinematic Vignette Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(0,0,0,0.7)_100%)] pointer-events-none" />

            {/* Top/Bottom Gradient for immersion */}
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />

            {/* Urgent Timer Glow Effect */}
            <AnimatePresence>
                {isUrgent && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            boxShadow: "inset 0 0 100px 20px rgba(239, 68, 68, 0.3)",
                        }}
                    />
                )}
            </AnimatePresence>




        </div >
    );
}
