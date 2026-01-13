"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function CurtainReveal({ children }) {
    const [phase, setPhase] = useState("CLOSED");

    useEffect(() => {
        const t1 = setTimeout(() => setPhase("OPENING"), 400);
        const t2 = setTimeout(() => setPhase("SPOTLIGHT"), 2000);
        const t3 = setTimeout(() => setPhase("REVEAL"), 3200);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, []);

    const isOpen = phase !== "CLOSED";
    const showSpotlight = phase === "SPOTLIGHT" || phase === "REVEAL";
    const showContent = phase === "REVEAL";

    return (
        <div className="fixed inset-0 w-screen h-screen bg-[#050505] overflow-hidden">
            {/* Subtle ambient light from top */}
            <div
                className="absolute top-0 left-0 right-0 h-1/3 pointer-events-none"
                style={{
                    background: "linear-gradient(to bottom, rgba(30,20,15,0.3) 0%, transparent 100%)",
                }}
            />

            {/* CURTAINS */}
            <div className="absolute inset-0 z-40 flex pointer-events-none">
                {/* LEFT CURTAIN */}
                <motion.div
                    className="relative w-1/2 h-full"
                    initial={{ x: 0 }}
                    animate={isOpen ? { x: "-100%" } : { x: 0 }}
                    transition={{ duration: 1.8, ease: [0.6, 0, 0.2, 1] }}
                    style={{
                        filter: "drop-shadow(20px 0 40px rgba(0,0,0,0.8))",
                    }}
                >
                    <div
                        className="absolute inset-0"
                        style={{
                            background: `linear-gradient(90deg, 
                #2a0a0a 0%, 
                #4a1515 15%, 
                #5a1a1a 30%, 
                #6a2020 45%,
                #5a1a1a 60%,
                #7a2525 75%,
                #5a1818 90%,
                #4a1212 100%
              )`,
                        }}
                    />
                    {/* Subtle vertical folds */}
                    <div
                        className="absolute inset-0 opacity-40"
                        style={{
                            background: `repeating-linear-gradient(90deg, 
                transparent 0px, 
                rgba(0,0,0,0.15) 1px,
                transparent 2px,
                transparent 40px
              )`,
                        }}
                    />
                    {/* Inner edge highlight */}
                    <div className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-l from-white/5 to-transparent" />
                    {/* Bottom shadow */}
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/40 to-transparent" />
                </motion.div>

                {/* RIGHT CURTAIN */}
                <motion.div
                    className="relative w-1/2 h-full"
                    initial={{ x: 0 }}
                    animate={isOpen ? { x: "100%" } : { x: 0 }}
                    transition={{ duration: 1.8, ease: [0.6, 0, 0.2, 1] }}
                    style={{
                        filter: "drop-shadow(-20px 0 40px rgba(0,0,0,0.8))",
                    }}
                >
                    <div
                        className="absolute inset-0"
                        style={{
                            background: `linear-gradient(270deg, 
                #2a0a0a 0%, 
                #4a1515 15%, 
                #5a1a1a 30%, 
                #6a2020 45%,
                #5a1a1a 60%,
                #7a2525 75%,
                #5a1818 90%,
                #4a1212 100%
              )`,
                        }}
                    />
                    <div
                        className="absolute inset-0 opacity-40"
                        style={{
                            background: `repeating-linear-gradient(90deg, 
                transparent 0px, 
                rgba(0,0,0,0.15) 1px,
                transparent 2px,
                transparent 40px
              )`,
                        }}
                    />
                    <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-white/5 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/40 to-transparent" />
                </motion.div>
            </div>

            {/* TOP PELMET */}
            <motion.div
                className="absolute top-0 left-0 right-0 h-10 z-50"
                initial={{ opacity: 1 }}
                animate={showContent ? { opacity: 0 } : { opacity: 1 }}
                transition={{ duration: 0.6 }}
                style={{
                    background: "linear-gradient(to bottom, #3a0e0e, #2a0a0a, transparent)",
                    filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.5))",
                }}
            />

            {/* SPOTLIGHT */}
            <motion.div
                className="absolute inset-0 z-35 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={showSpotlight ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 1 }}
            >
                {/* Spotlight cone */}
                <motion.div
                    className="absolute top-0 left-1/2 -translate-x-1/2"
                    initial={{ scaleY: 0 }}
                    animate={showSpotlight ? { scaleY: 1 } : { scaleY: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{
                        width: "250px",
                        height: "45vh",
                        background: `linear-gradient(180deg, 
              rgba(255,248,220,0.12) 0%, 
              rgba(255,248,220,0.04) 50%,
              transparent 100%
            )`,
                        clipPath: "polygon(40% 0%, 60% 0%, 95% 100%, 5% 100%)",
                        transformOrigin: "top center",
                    }}
                />

                {/* Spotlight pool */}
                <motion.div
                    className="absolute top-[28%] left-1/2 -translate-x-1/2"
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={showSpotlight ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
                    transition={{ duration: 1, delay: 0.3 }}
                    style={{
                        width: "400px",
                        height: "200px",
                        background: "radial-gradient(ellipse, rgba(255,250,210,0.1) 0%, transparent 70%)",
                    }}
                />
            </motion.div>

            {/* CONTENT */}
            <motion.div
                className="relative z-30 w-full h-full overflow-auto"
                initial={{ opacity: 0 }}
                animate={showContent ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
            >
                {children}
            </motion.div>
        </div>
    );
}
