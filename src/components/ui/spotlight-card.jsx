"use client";

import React from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

export const SpotlightCard = ({ children, className = "" }) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }) {
        let { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <motion.div
            onMouseMove={handleMouseMove}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "group relative rounded-2xl border border-white/10 bg-zinc-900/50 overflow-hidden",
                className
            )}
        >
            {/* The Spotlight Border Overlay */}
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-500 group-hover:opacity-100 bg-white/10"
                style={{
                    background: useMotionTemplate`
            radial-gradient(
              600px circle at ${mouseX}px ${mouseY}px,
              var(--primary),
              transparent 40%
            )
          `,
                }}
            />

            <div className="relative h-full">{children}</div>
        </motion.div>
    );
};
