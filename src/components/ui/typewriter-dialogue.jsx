"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * TypewriterDialogue - "Script Reveal" for Stage 2
 * 
 * Features:
 * - Monospace font (Courier Prime styled)
 * - Staggered typewriter effect (random delays)
 * - "Projector Light Beam" highlighting the text
 */
export default function TypewriterDialogue({
    dialogue,
    onComplete,
    typingSpeed = 50,
    startDelay = 500,
    showQuotes = true,
    className = ""
}) {
    const [displayedText, setDisplayedText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [showCursor, setShowCursor] = useState(true);
    const timeoutRef = useRef(null);
    const charIndexRef = useRef(0);

    // Initial reset
    useEffect(() => {
        if (!dialogue) return;
        setDisplayedText("");
        charIndexRef.current = 0;
        setIsTyping(false);

        const startTimeout = setTimeout(() => {
            setIsTyping(true);
        }, startDelay);

        return () => clearTimeout(startTimeout);
    }, [dialogue, startDelay]);

    // Typing logic with random jitter
    useEffect(() => {
        if (!isTyping || !dialogue) return;

        const typeNextChar = () => {
            if (charIndexRef.current < dialogue.length) {
                setDisplayedText(dialogue.slice(0, charIndexRef.current + 1));
                charIndexRef.current++;

                const char = dialogue[charIndexRef.current - 1];
                let baseDelay = typingSpeed;

                // Dynamic delays for realism
                if (['.', '!', '?', ','].includes(char)) baseDelay *= 4; // Long pause at punctuation
                else if (char === ' ') baseDelay *= 1.5; // Slight pause between words

                // Add random jitter creates "manual" feel
                const randomJitter = (Math.random() * 0.5 + 0.5);

                timeoutRef.current = setTimeout(typeNextChar, baseDelay * randomJitter);
            } else {
                setIsTyping(false);
                setTimeout(() => {
                    setShowCursor(false);
                    onComplete?.();
                }, 1000);
            }
        };

        typeNextChar();

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [isTyping, dialogue, typingSpeed, onComplete]);

    // Cursor blink
    useEffect(() => {
        if (!showCursor) return;
        const blinkInterval = setInterval(() => {
            setShowCursor(prev => !prev);
        }, 530);
        return () => clearInterval(blinkInterval);
    }, [showCursor]);

    if (!dialogue) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className={`relative flex items-center justify-center min-h-[300px] w-full max-w-4xl mx-auto rounded-xl overflow-hidden ${className}`}
        >
            {/* Darkened backdrop for focus */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Projector Light Beam */}
            <div
                className="absolute inset-0 pointer-events-none mix-blend-screen opacity-40"
                style={{
                    background: 'conic-gradient(from 0deg at 50% -20%, transparent 45%, rgba(255,255,255,0.1) 48%, rgba(255,255,255,0.2) 52%, transparent 55%)',
                    filter: 'blur(40px)',
                    transform: 'scaleY(1.5)'
                }}
            />

            {/* Beam Glow Spot */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-30 mix-blend-screen"
                style={{
                    background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 60%)'
                }}
            />

            {/* Quote Container */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="relative z-10 max-w-2xl mx-auto px-8 py-12 text-center"
            >
                {/* Script Paper Texture (Subtle) */}
                <div className="absolute inset-0 bg-white/5 opacity-0 mix-blend-overlay rounded-lg blur-xl" />

                <div className="relative font-mono">
                    <motion.p
                        className="text-xl md:text-2xl lg:text-3xl text-neutral-200 leading-loose tracking-wide font-mono"
                        style={{
                            textShadow: "0 2px 10px rgba(0,0,0,0.5)"
                        }}
                    >
                        {startDelay === 0 ? "" : (
                            <span className="opacity-40 select-none text-4xl leading-none font-serif text-sky-500">“</span>
                        )}
                        <br />
                        <span className="text-white relative z-10 italic">
                            {displayedText}
                        </span>
                        {/* Closing Quote (only when done) */}
                        {!isTyping && !showCursor && (
                            <span className="opacity-40 select-none text-4xl leading-none font-serif text-sky-500 ml-2">”</span>
                        )}

                        <AnimatePresence>
                            {(isTyping || showCursor) && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: showCursor ? 1 : 0 }}
                                    className="inline-block w-[2px] h-[1em] bg-sky-400 ml-1 align-middle"
                                    style={{ boxShadow: "0 0 8px #38bdf8" }}
                                />
                            )}
                        </AnimatePresence>
                    </motion.p>
                </div>

                {/* Hint Label */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                    className="mt-12 flex items-center justify-center gap-2"
                >
                    <div className="h-px w-12 bg-gradient-to-r from-transparent via-sky-500/50 to-transparent" />
                    <span className="text-sky-400/80 text-xs font-medium uppercase tracking-[0.2em]">Famous Quote</span>
                    <div className="h-px w-12 bg-gradient-to-r from-transparent via-sky-500/50 to-transparent" />
                </motion.div>
            </motion.div>
        </motion.div>
    );
}
