"use client";
import { motion } from "framer-motion";

/**
 * FilmReelSpinner - Subtle, cinematic loading indicator
 * 
 * Uses a minimal film reel design with industry-colored accents
 */

const industryColors = {
    HOLLYWOOD: "#3b82f6",
    BOLLYWOOD: "#f97316",
    ANIME: "#a855f7",
    GLOBAL: "#10b981",
};

export default function FilmReelSpinner({
    size = "md",
    industry = "HOLLYWOOD",
    className = ""
}) {
    const sizes = {
        sm: { container: "w-6 h-6", stroke: 1 },
        md: { container: "w-10 h-10", stroke: 1.5 },
        lg: { container: "w-14 h-14", stroke: 2 },
    };

    const config = sizes[size] || sizes.md;
    const color = industryColors[industry] || industryColors.HOLLYWOOD;

    return (
        <motion.div
            className={`relative ${config.container} ${className}`}
            animate={{ rotate: 360 }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
            }}
        >
            {/* Outer ring */}
            <svg viewBox="0 0 24 24" className="w-full h-full" fill="none">
                <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth={config.stroke}
                    className="text-neutral-800"
                />
                {/* Spinning arc */}
                <path
                    d="M12 2a10 10 0 0 1 10 10"
                    stroke={color}
                    strokeWidth={config.stroke}
                    strokeLinecap="round"
                    opacity="0.9"
                />
                {/* Inner film sprocket holes */}
                <circle cx="12" cy="5" r="1" fill={color} opacity="0.4" />
                <circle cx="19" cy="12" r="1" fill={color} opacity="0.4" />
                <circle cx="12" cy="19" r="1" fill={color} opacity="0.4" />
                <circle cx="5" cy="12" r="1" fill={color} opacity="0.4" />
            </svg>
        </motion.div>
    );
}

// Simple inline spinner for buttons etc
export function InlineSpinner({ className = "" }) {
    return (
        <motion.div
            className={`w-4 h-4 border-2 border-neutral-600 border-t-white rounded-full ${className}`}
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        />
    );
}
