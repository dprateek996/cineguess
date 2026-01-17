"use client";
import { motion, AnimatePresence } from "framer-motion";

/**
 * StageTransition - Cross-dissolve transition wrapper between hint stages
 * 
 * Features:
 * - Fade + blur out of current stage
 * - Fade + scale in of new stage
 * - Smooth 0.5s transitions
 */
export default function StageTransition({
    stage,
    children,
    className = ""
}) {
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={stage}
                initial={{
                    opacity: 0,
                    scale: 0.95,
                    filter: "blur(10px)"
                }}
                animate={{
                    opacity: 1,
                    scale: 1,
                    filter: "blur(0px)"
                }}
                exit={{
                    opacity: 0,
                    scale: 1.05,
                    filter: "blur(10px)"
                }}
                transition={{
                    duration: 0.5,
                    ease: [0.4, 0, 0.2, 1]
                }}
                className={`relative w-full ${className}`}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
