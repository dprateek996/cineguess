"use client";
import { useMousePosition } from "@/hooks/use-mouse-position";
import { motion } from "framer-motion";

export function CinematicBackground() {
    const { x, y } = useMousePosition();

    return (
        <div className="fixed inset-0 bg-[#0a0a0a] overflow-hidden pointer-events-none z-0">
            {/* The Dynamic Projector Beam - reduced opacity for subtlety */}
            <motion.div
                className="absolute inset-0 transition-opacity duration-300"
                style={{
                    background: `radial-gradient(800px circle at ${x}px ${y}px, rgba(255,255,255,0.03), transparent 60%)`,
                }}
            />

            {/* Ambient Projector Flicker - subtle global pulse */}
            <motion.div
                className="absolute inset-0 bg-white/5 mix-blend-overlay"
                animate={{ opacity: [0, 0.02, 0.01, 0.03, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", times: [0, 0.2, 0.5, 0.8, 1] }}
            />

            {/* The "Film Grain" Overlay - CSS noise */}
            <div
                className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
            />
        </div>
    );
}
