"use client";

import React, { useState } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

export const SpotlightCard = ({ children, className = "" }) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const [isHovered, setIsHovered] = useState(false);

    function handleMouseMove({ currentTarget, clientX, clientY }) {
        let { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <motion.div
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "group relative rounded-2xl border border-white/10 bg-zinc-900/50 overflow-hidden",
                className
            )}
        >
            {/* The Spotlight Border Overlay - Primary Glow on Hover */}
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-2xl"
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                style={{
                    background: useMotionTemplate`
            radial-gradient(
              450px circle at ${mouseX}px ${mouseY}px,
              var(--primary),
              transparent 40%
            )
          `,
                }}
            />

            <div className="relative h-full w-full">{children}</div>
        </motion.div>
    );
};

