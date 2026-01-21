"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const LampContainer = ({
    children,
    className,
}) => {
    return (
        <div
            className={cn(
                "relative flex min-h-[40rem] flex-col items-center justify-center overflow-hidden bg-background w-full rounded-md z-0",
                className
            )}
        >
            <div className="relative flex w-full flex-1 scale-y-125 items-center justify-center isolate z-0 ">
                {/* 1. Large Faint Ambient Glow */}
                <motion.div
                    initial={{ opacity: 0.2, scale: 2 }}
                    whileInView={{ opacity: 0.4, scale: 2.5 }}
                    transition={{ delay: 0.3, duration: 1.5, ease: "easeInOut" }}
                    className="absolute inset-auto z-10 h-[30rem] w-[50rem] bg-primary/20 blur-[100px] rounded-full mix-blend-screen"
                />

                {/* 2. Main Beam (Conic) - Softer & Masked */}
                <motion.div
                    initial={{ opacity: 0.5, width: "15rem" }}
                    whileInView={{ opacity: 1, width: "30rem" }}
                    transition={{
                        delay: 0.3,
                        duration: 0.8,
                        ease: "easeInOut",
                    }}
                    style={{
                        backgroundImage: `conic-gradient(var(--konic-position, from 70deg at center top), var(--primary) 0deg, transparent 55deg, transparent 305deg, var(--primary) 360deg)`,
                    }}
                    className="absolute inset-auto right-1/2 h-56 overflow-visible w-[30rem] bg-gradient-conic from-primary via-transparent to-transparent text-white [--konic-position:from_70deg_at_center_top]"
                >
                    <div className="absolute w-[100%] left-0 bg-background h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
                    <div className="absolute w-40 h-[100%] left-0 bg-background bottom-0 z-20 [mask-image:linear-gradient(to_right,white,transparent)]" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0.5, width: "15rem" }}
                    whileInView={{ opacity: 1, width: "30rem" }}
                    transition={{
                        delay: 0.3,
                        duration: 0.8,
                        ease: "easeInOut",
                    }}
                    style={{
                        backgroundImage: `conic-gradient(var(--konic-position, from 290deg at center top), transparent 0deg, transparent 55deg, var(--primary) 360deg)`,
                    }}
                    className="absolute inset-auto left-1/2 h-56 w-[30rem] bg-gradient-conic from-transparent via-transparent to-primary text-white [--konic-position:from_290deg_at_center_top]"
                >
                    <div className="absolute w-40 h-[100%] right-0 bg-background bottom-0 z-20 [mask-image:linear-gradient(to_left,white,transparent)]" />
                    <div className="absolute w-[100%] right-0 bg-background h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
                </motion.div>

                {/* 3. Tight Source Hotspot */}
                <motion.div
                    initial={{ width: "8rem", opacity: 0.5 }}
                    whileInView={{ width: "16rem", opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
                    className="absolute inset-auto z-50 h-36 w-64 -translate-y-[6rem] rounded-full bg-primary/60 blur-2xl mix-blend-screen"
                />

                {/* 4. The Source Line (Bulb) */}
                <motion.div
                    initial={{ width: "15rem" }}
                    whileInView={{ width: "30rem" }}
                    transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
                    className="absolute inset-auto z-50 h-0.5 w-[30rem] -translate-y-[7rem] bg-primary/80 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                />

                <div className="absolute inset-auto z-40 h-44 w-full -translate-y-[12.5rem] bg-background "></div>
            </div>

            <div className="relative z-50 flex -translate-y-80 flex-col items-center px-5">
                {children}
            </div>
        </div>
    );
};
