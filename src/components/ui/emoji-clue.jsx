"use client";
import { motion } from "framer-motion";

/**
 * EmojiClue - Animated emoji plot representation
 * 
 * Features:
 * - Sequential bounce-in animation for each emoji
 * - Large, centered display with glow effect
 * - Subtle pulse animation after reveal
 */
export default function EmojiClue({
    emojis,
    onComplete,
    className = ""
}) {
    // Parse emojis - can be string "🥷🐢🍕" or array ["🥷", "🐢", "🍕"]
    const emojiArray = Array.isArray(emojis)
        ? emojis
        : [...(emojis || "")].filter(char => /\p{Emoji}/u.test(char));

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3,
            }
        }
    };

    const emojiVariants = {
        hidden: {
            opacity: 0,
            scale: 0,
            y: 50,
            rotate: -20
        },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            rotate: 0,
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 15,
            }
        }
    };

    if (!emojis || emojiArray.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className={`relative flex flex-col items-center justify-center min-h-[300px] ${className}`}
        >
            {/* Dark cinematic backdrop */}
            <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950" />

            {/* Subtle glow behind emojis */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at center, rgba(251, 191, 36, 0.1) 0%, transparent 60%)'
                }}
            />

            {/* Hint label - top */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative z-10 mb-6 flex items-center gap-2"
            >
                <span className="text-purple-400 text-lg">🎭</span>
                <span className="text-neutral-500 text-sm uppercase tracking-widest">Plot in Emojis</span>
            </motion.div>

            {/* Emoji container */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                onAnimationComplete={() => {
                    setTimeout(() => onComplete?.(), 500);
                }}
                className="relative z-10 flex items-center justify-center gap-4 md:gap-6"
            >
                {emojiArray.map((emoji, index) => (
                    <motion.div
                        key={index}
                        variants={emojiVariants}
                        className="relative"
                    >
                        {/* Glow effect per emoji */}
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.3, 0.5, 0.3]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: index * 0.3
                            }}
                            className="absolute inset-0 blur-xl bg-amber-500/30 rounded-full"
                        />

                        {/* The emoji */}
                        <motion.span
                            animate={{
                                y: [0, -5, 0],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: index * 0.2,
                                ease: "easeInOut"
                            }}
                            className="relative text-6xl md:text-7xl lg:text-8xl select-none drop-shadow-2xl"
                            style={{
                                textShadow: '0 0 30px rgba(251, 191, 36, 0.3)'
                            }}
                        >
                            {emoji}
                        </motion.span>
                    </motion.div>
                ))}
            </motion.div>

            {/* Hint text */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="relative z-10 mt-8 text-neutral-400 text-sm"
            >
                Can you decode the plot?
            </motion.p>

            {/* Decorative elements */}
            <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="absolute bottom-16 w-32 h-[1px] bg-gradient-to-r from-transparent via-neutral-600 to-transparent"
            />
        </motion.div>
    );
}
