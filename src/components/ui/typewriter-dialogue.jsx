"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * TypewriterDialogue - "Famous Quote" for Stage 2
 * Features:
 * - High contrast text for readability
 * - Large typographic quotes
 * - Staggered typewriter effect
 */
export default function TypewriterDialogue({
    dialogue,
    onComplete,
    typingSpeed = 40,
    startDelay = 500,
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

    // Typing logic
    useEffect(() => {
        if (!isTyping || !dialogue) return;

        const typeNextChar = () => {
            if (charIndexRef.current < dialogue.length) {
                setDisplayedText(dialogue.slice(0, charIndexRef.current + 1));
                charIndexRef.current++;

                const char = dialogue[charIndexRef.current - 1];
                let baseDelay = typingSpeed;

                // Dynamic delays for realism
                if (['.', '!', '?', ','].includes(char)) baseDelay *= 4;
                else if (char === ' ') baseDelay *= 1.5;

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

            {/* Quote Container */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="relative z-10 max-w-3xl mx-auto px-10 py-16 text-center"
            >
                <div className="relative">
                    <motion.p
                        className="text-2xl md:text-3xl lg:text-4xl leading-relaxed font-medium tracking-wide font-serif"
                        style={{
                            textShadow: "0 4px 20px rgba(0,0,0,0.8)"
                        }}
                    >
                        {startDelay === 0 ? "" : (
                            <span className="opacity-80 select-none text-6xl leading-none font-serif text-white/20 absolute -top-8 -left-4">“</span>
                        )}

                        <span className="relative z-10 text-white drop-shadow-md">
                            {displayedText}
                        </span>

                        {/* Closing Quote */}
                        {!isTyping && !showCursor && (
                            <span className="opacity-80 select-none text-6xl leading-none font-serif text-white/20 absolute -bottom-10 -right-4">”</span>
                        )}

                        <AnimatePresence>
                            {(isTyping || showCursor) && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: showCursor ? 1 : 0 }}
                                    className="inline-block w-[3px] h-[1.2em] bg-sky-400 ml-1 align-bottom rounded-full"
                                    style={{ boxShadow: "0 0 10px #38bdf8" }}
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
                    className="mt-16 flex items-center justify-center gap-4"
                >
                    <div className="h-px w-12 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <span className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em]">Famous Quote</span>
                    <div className="h-px w-12 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </motion.div>
            </motion.div>
        </motion.div>
    );
}
