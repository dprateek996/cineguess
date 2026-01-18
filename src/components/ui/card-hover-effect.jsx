"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function CardHoverEffect({ items, className }) {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    return (
        <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
            {items.map((item, idx) => (
                <Link
                    href={item.link}
                    key={item.title}
                    className="relative group block p-2 h-full w-full"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                >
                    {/* Animated background on hover */}
                    {hoveredIndex === idx && (
                        <motion.span
                            className="absolute inset-0 h-full w-full bg-white/[0.03] block rounded-3xl"
                            layoutId="hoverBackground"
                            initial={{ opacity: 0 }}
                            animate={{
                                opacity: 1,
                                transition: { duration: 0.15 },
                            }}
                            exit={{
                                opacity: 0,
                                transition: { duration: 0.15, delay: 0.2 },
                            }}
                        />
                    )}
                    <Card item={item} isHovered={hoveredIndex === idx} />
                </Link>
            ))}
        </div>
    );
}

function Card({ item, isHovered }) {
    const gradientClass = item.gradient || "from-blue-500 to-cyan-500";

    return (
        <motion.div
            className={cn(
                "rounded-2xl h-full w-full p-6 overflow-hidden",
                "bg-gradient-to-br border border-white/10",
                "transition-all duration-300 relative z-10",
                isHovered ? "border-white/20" : ""
            )}
            style={{
                background: isHovered
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(255,255,255,0.02)",
            }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            {/* Icon */}
            <div className="text-5xl mb-4">{item.icon}</div>

            {/* Title with gradient */}
            <h3 className={cn(
                "text-2xl font-bold mb-3 bg-gradient-to-r bg-clip-text text-transparent",
                gradientClass
            )}>
                {item.title}
            </h3>

            {/* Description */}
            <p className="text-neutral-400 text-sm leading-relaxed">
                {item.description}
            </p>

            {/* Glowing orb in corner */}
            <div
                className={cn(
                    "absolute -bottom-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-20 transition-opacity duration-300",
                    `bg-gradient-to-r ${gradientClass}`,
                    isHovered ? "opacity-40" : "opacity-20"
                )}
            />
        </motion.div>
    );
}
