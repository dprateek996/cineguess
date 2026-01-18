"use client";
import { motion } from "framer-motion";

export function AnimatedGradient({ children, className }) {
    return (
        <div className={`relative ${className}`}>
            {/* Animated gradient background */}
            <motion.div
                className="absolute inset-0 -z-10 overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
            >
                {/* Top left orb */}
                <motion.div
                    className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px]"
                    animate={{
                        x: [0, 30, 0],
                        y: [0, 20, 0],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />

                {/* Top right orb */}
                <motion.div
                    className="absolute -top-20 -right-20 w-60 h-60 bg-blue-500/20 rounded-full blur-[100px]"
                    animate={{
                        x: [0, -20, 0],
                        y: [0, 30, 0],
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />

                {/* Bottom center orb */}
                <motion.div
                    className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px]"
                    animate={{
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            </motion.div>

            {children}
        </div>
    );
}
