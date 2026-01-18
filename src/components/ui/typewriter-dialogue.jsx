"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * TypewriterDialogue - Elegant typewriter animation for famous movie quotes
 * 
 * Features:
 * - Character-by-character reveal with blinking cursor
 * - Cinematic quote styling with dramatic entrance
 * - Customizable speed and delay
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

    useEffect(() => {
        if (!dialogue) return;

        // Reset state for new dialogue
        setDisplayedText("");
        charIndexRef.current = 0;
        setIsTyping(false);

        // Start typing after delay
        const startTimeout = setTimeout(() => {
            setIsTyping(true);
        }, startDelay);

        return () => {
            clearTimeout(startTimeout);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [dialogue, startDelay]);

    useEffect(() => {
        if (!isTyping || !dialogue) return;

        const typeNextChar = () => {
            if (charIndexRef.current < dialogue.length) {
                setDisplayedText(dialogue.slice(0, charIndexRef.current + 1));
                charIndexRef.current++;


                const char = dialogue[charIndexRef.current - 1];
                const delay = ['.', '!', '?', ','].includes(char)
                    ? typingSpeed * 4
                    : typingSpeed;

                timeoutRef.current = setTimeout(typeNextChar, delay);
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

    // Cursor blink effect
    useEffect(() => {
        if (!showCursor) return;

        const blinkInterval = setInterval(() => {
            setShowCursor(prev => !prev);
        }, 530);

        return () => clearInterval(blinkInterval);
    }, []);

    if (!dialogue) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className={`relative flex items-center justify-center min-h-[300px] ${className}`}
        >
            {/* Cinematic backdrop */}
            <div className="absolute inset-0 bg-gradient-to-b from-black via-neutral-950 to-black" />

            {/* Vignette effect */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.7) 100%)'
                }}
            />

            {/* Quote container */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="relative z-10 max-w-2xl mx-auto px-8 text-center"
            >
                {/* Decorative line above */}
                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="w-16 h-[1px] bg-gradient-to-r from-transparent via-neutral-500 to-transparent mx-auto mb-8"
                />

                {/* The quote */}
                <div className="relative">
                    {showQuotes && (
                        <span className="absolute -left-4 -top-4 text-5xl text-neutral-600/50 font-serif select-none">
                            "
                        </span>
                    )}

                    <motion.p
                        className="text-2xl md:text-3xl lg:text-4xl font-light text-white leading-relaxed tracking-wide font-serif italic"
                        animate={{
                            textShadow: displayedText.length === dialogue?.length
                                ? "0 0 20px rgba(251, 191, 36, 0.4), 0 0 40px rgba(251, 191, 36, 0.2)"
                                : "none"
                        }}
                        transition={{ duration: 0.5 }}
                    >
                        {displayedText}
                        <AnimatePresence>
                            {(isTyping || showCursor) && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: showCursor ? 1 : 0 }}
                                    className="inline-block w-[3px] h-[1.2em] bg-amber-400 ml-1 align-middle"
                                />
                            )}
                        </AnimatePresence>
                    </motion.p>

                    {showQuotes && displayedText.length > 0 && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: displayedText.length === dialogue?.length ? 0.5 : 0 }}
                            transition={{ delay: 0.5 }}
                            className="absolute -right-4 -bottom-4 text-5xl text-neutral-600/50 font-serif select-none"
                        >
                            "
                        </motion.span>
                    )}
                </div>

                {/* Hint label */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: startDelay / 1000 + 0.5 }}
                    className="mt-8 flex items-center justify-center gap-2"
                >
                    <span className="text-amber-500 text-lg">💬</span>
                    <span className="text-neutral-500 text-sm uppercase tracking-widest">Famous Dialogue</span>
                </motion.div>

                {/* Decorative line below */}
                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="w-16 h-[1px] bg-gradient-to-r from-transparent via-neutral-500 to-transparent mx-auto mt-8"
                />
            </motion.div>

            {/* Subtle film grain overlay */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
                }}
            />
        </motion.div>
    );
}
