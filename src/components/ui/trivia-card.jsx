"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * TriviaCard - Movie-buff trivia for Stage 3
 * 
 * Replaces EmojiClue with authentic movie facts:
 * - Box office milestones
 * - Behind-the-scenes trivia  
 * - Cinematography highlights
 * - Production controversies
 * 
 * Features typewriter reveal with "Did you know?" prefix
 */

const industryGlows = {
    HOLLYWOOD: { color: "#3b82f6", secondary: "#22d3ee" },
    BOLLYWOOD: { color: "#f97316", secondary: "#fbbf24" },
    ANIME: { color: "#a855f7", secondary: "#ec4899" },
    GLOBAL: { color: "#10b981", secondary: "#14b8a6" },
};

export default function TriviaCard({
    trivia,
    industry = "HOLLYWOOD",
    onComplete,
    className = ""
}) {
    const [displayedText, setDisplayedText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const charIndexRef = useRef(0);
    const timeoutRef = useRef(null);

    const glow = industryGlows[industry] || industryGlows.HOLLYWOOD;

    // Start typing effect
    useEffect(() => {
        if (!trivia) return;

        setDisplayedText("");
        charIndexRef.current = 0;
        setIsComplete(false);

        const startTimeout = setTimeout(() => {
            setIsTyping(true);
        }, 600);

        return () => {
            clearTimeout(startTimeout);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [trivia]);

    // Typewriter effect
    useEffect(() => {
        if (!isTyping || !trivia) return;

        const typeNextChar = () => {
            if (charIndexRef.current < trivia.length) {
                setDisplayedText(trivia.slice(0, charIndexRef.current + 1));
                charIndexRef.current++;

                const char = trivia[charIndexRef.current - 1];
                const delay = ['.', '!', '?', ',', '—'].includes(char) ? 80 : 25;

                timeoutRef.current = setTimeout(typeNextChar, delay);
            } else {
                setIsTyping(false);
                setIsComplete(true);
                setTimeout(() => onComplete?.(), 500);
            }
        };

        typeNextChar();

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [isTyping, trivia, onComplete]);

    if (!trivia) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`relative w-full max-w-2xl mx-auto ${className}`}
        >
            {/* Card container */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                className="relative rounded-xl overflow-hidden"
                style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    boxShadow: `
                        0 4px 24px rgba(0,0,0,0.4),
                        0 0 0 1px rgba(255,255,255,0.02) inset,
                        0 0 40px ${glow.color}10
                    `,
                }}
            >
                {/* Glow accent on complete */}
                <AnimatePresence>
                    {isComplete && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute -inset-px rounded-xl pointer-events-none"
                            style={{
                                background: `linear-gradient(135deg, ${glow.color}15, transparent 50%, ${glow.secondary}10)`,
                            }}
                        />
                    )}
                </AnimatePresence>

                {/* Content */}
                <div className="relative px-6 py-5 md:px-8 md:py-6">
                    {/* "Did you know?" prefix */}
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center gap-2 mb-3"
                    >
                        <svg
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            style={{ color: glow.color }}
                        >
                            <path
                                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        <span
                            className="text-[10px] font-semibold uppercase tracking-[0.2em]"
                            style={{ color: glow.color }}
                        >
                            Did you know?
                        </span>
                    </motion.div>

                    {/* Trivia text with typewriter */}
                    <p
                        className="text-base md:text-lg leading-relaxed font-light"
                        style={{
                            color: isComplete ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.85)",
                            fontStyle: "italic",
                            textShadow: isComplete ? `0 0 30px ${glow.color}30` : "none",
                            transition: "text-shadow 0.5s ease",
                        }}
                    >
                        "{displayedText}
                        {/* Typing cursor */}
                        {isTyping && (
                            <motion.span
                                animate={{ opacity: [1, 0] }}
                                transition={{ duration: 0.5, repeat: Infinity }}
                                className="inline-block w-0.5 h-[1.1em] ml-0.5 align-middle"
                                style={{ background: glow.color }}
                            />
                        )}
                        {displayedText.length > 0 && !isTyping && '"'}
                    </p>

                    {/* Subtle decorative line */}
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: isComplete ? 1 : 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="mt-4 h-px w-16 origin-left"
                        style={{
                            background: `linear-gradient(90deg, ${glow.color}50, transparent)`,
                        }}
                    />
                </div>

                {/* Stage label */}
                <div className="px-6 pb-4 md:px-8 md:pb-5">
                    <div className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-neutral-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <span className="text-[10px] text-neutral-500 uppercase tracking-[0.15em]">Trivia Clue</span>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
