"use client";
import { motion } from "framer-motion";

/**
 * SoundToggle - Mute/unmute button for game audio
 */
export default function SoundToggle({ isMuted, onToggle, className = "" }) {
    return (
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggle}
            className={`
                w-10 h-10 rounded-full flex items-center justify-center
                glass border border-neutral-700/50 hover:border-neutral-600
                transition-colors ${className}
            `}
            aria-label={isMuted ? "Unmute sounds" : "Mute sounds"}
            title={isMuted ? "Unmute sounds" : "Mute sounds"}
        >
            <motion.span
                key={isMuted ? "muted" : "unmuted"}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                className="text-lg"
            >
                {isMuted ? "🔇" : "🔊"}
            </motion.span>
        </motion.button>
    );
}
