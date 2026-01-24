"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { Icons } from "@/components/Icons";
import { Button } from "@/components/ui/button";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { BorderBeam } from "@/components/ui/border-beam";
import CurtainReveal from "@/components/ui/curtain-reveal";

// --- Visual "Noise" Texture for that Film Grain feel ---
const FilmGrain = () => (
    <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.04] mix-blend-soft-light"
        style={{
            backgroundImage: `url('/noise.png')`,
            backgroundRepeat: "repeat",
        }}
    />
);

function GameLanding() {
    const containerRef = useRef(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Local mouse coordinates for the header spotlight
    const headerX = useMotionValue(0);
    const headerY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }) {
        let { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    function handleHeaderMouseMove({ currentTarget, clientX, clientY }) {
        let { left, top } = currentTarget.getBoundingClientRect();
        headerX.set(clientX - left);
        headerY.set(clientY - top);
    }

    // --- Animation Variants ---
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2, // Faster initial load
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
    };

    return (
        <div
            className="relative min-h-screen w-full overflow-hidden bg-background font-sans selection:bg-primary/20 selection:text-primary"
            onMouseMove={handleMouseMove}
        >
            {/* 1. Ambient Background Atmosphere (Soft, Diffused, "Lobby" feel) */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--gradient-center)_0%,_transparent_65%)] opacity-30 blur-3xl [--gradient-center:theme(colors.primary.DEFAULT/10)]" />
                {/* Subtle secondary glow for depth */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background/0 to-transparent blur-3xl opacity-50" />
            </div>

            <FilmGrain />

            <motion.div
                className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-8 md:px-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* --- Header Section (Tightened & Polished) --- */}
                <motion.div
                    variants={itemVariants}
                    className="relative z-20 mb-10 text-center md:mb-12 group/header"
                    onMouseEnter={() => containerRef.current?.classList.add('header-hover')}
                    onMouseLeave={() => containerRef.current?.classList.remove('header-hover')}
                    onMouseMove={handleHeaderMouseMove}
                >
                    {/* Logo Icon / Brand Mark */}
                    <div className="mb-5 flex justify-center">
                        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900/80 ring-1 ring-white/10 backdrop-blur-md shadow-2xl">
                            <Icons.Projector className="h-7 w-7 text-primary" />
                            {/* Subtle inner glow for the icon box */}
                            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5" />
                        </div>
                    </div>

                    <div className="relative flex flex-col items-center justify-center leading-[0.85]">
                        {/* "CINE" - Solid Metallic */}
                        <h1 className="relative text-7xl font-extrabold tracking-[-0.05em] sm:text-8xl md:text-9xl lg:text-[10rem] select-none text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 drop-shadow-sm">
                            CINE
                        </h1>

                        {/* "QUEST" - Spotlight Mask (Only on header hover) */}
                        <motion.div className="relative -mt-4 sm:-mt-6 select-none">
                            {/* Base Layer: Outline */}
                            <h1
                                className="text-7xl font-medium tracking-tighter sm:text-8xl md:text-9xl lg:text-[10rem] text-transparent opacity-30 mix-blend-overlay"
                                style={{ WebkitTextStroke: "2px rgba(255,255,255,0.5)" }}
                            >
                                QUEST
                            </h1>

                            {/* Spotlight Reveal Layer */}
                            <motion.h1
                                className="absolute inset-0 text-7xl font-medium tracking-tighter sm:text-8xl md:text-9xl lg:text-[10rem] text-[#fbbf24] z-10 opacity-0 group-hover/header:opacity-100 transition-opacity duration-300"
                                style={{
                                    WebkitTextStroke: "2px #fbbf24",
                                    mixBlendMode: "plus-lighter",
                                    maskImage: useMotionTemplate`radial-gradient(
                                        300px circle at ${headerX}px ${headerY}px, 
                                        rgba(0,0,0,1) 0%, 
                                        transparent 100%
                                    )`,
                                    WebkitMaskImage: useMotionTemplate`radial-gradient(
                                        300px circle at ${headerX}px ${headerY}px, 
                                        rgba(0,0,0,1) 0%, 
                                        transparent 100%
                                    )`
                                }}
                            >
                                QUEST
                            </motion.h1>
                        </motion.div>

                        {/* Tagline - Tightened Spacing */}
                        <motion.p
                            className="mt-6 md:mt-8 text-xs font-bold uppercase tracking-[0.3em] text-white/40"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, duration: 1 }}
                        >
                            Frame-by-Frame Trivia
                        </motion.p>
                    </div>
                </motion.div>


                {/* --- Game Mode Cards (Glassmorphic & Spotlight) --- */}
                <motion.div
                    variants={itemVariants}
                    className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:max-w-4xl lg:grid-cols-2" // Reduced gap
                >
                    <ModeCard
                        href="/play/bollywood"
                        title="Bollywood"
                        subtitle="Masala & Magic"
                        icon={Icons.Bollywood}
                    />
                    <ModeCard
                        href="/play/hollywood"
                        title="Hollywood"
                        subtitle="Stars & Studios"
                        icon={Icons.Hollywood}
                    />
                </motion.div>

                {/* --- Daily Challenge (Subtle Button) --- */}
                <motion.div variants={itemVariants} className="mt-16">
                    <Link href="/daily" className="relative inline-block group">
                        {/* Background Glow */}
                        <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-primary/10 to-primary/0 blur opacity-0 transition duration-500 group-hover:opacity-60" />

                        <Button variant="ghost" className="relative h-12 rounded-full px-8 overflow-hidden bg-zinc-900/50 backdrop-blur-sm border border-white/5 group-hover:bg-zinc-900/80 transition-all duration-300">
                            <BorderBeam size={60} duration={5} delay={0} borderWidth={2} colorFrom="#fbbf24" colorTo="transparent" />

                            <span className="relative z-10 flex items-center text-xs font-medium uppercase tracking-widest text-white/40 group-hover:text-primary transition-colors">
                                Daily Challenge
                                <span className="ml-2 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                                    <Icons.Play className="h-3 w-3 fill-current" />
                                </span>
                            </span>
                        </Button>
                    </Link>
                </motion.div>

            </motion.div>
        </div>
    );
}

// --- Spotlight Card Component Wrapper for Game Modes ---
function ModeCard({ href, title, subtitle, icon: Icon, disabled }) {
    const content = (
        <SpotlightCard className="h-full px-6 py-8 transition-all hover:scale-[1.01] active:scale-[0.99] flex flex-col items-start justify-between min-h-[180px] bg-zinc-900/40 backdrop-blur-md">
            {/* Top Inner Glow (Punchiness) */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-60" />

            <div className="relative z-10 flex w-full flex-col gap-4">
                {/* Header: Icon & Title */}
                <div className="flex items-center gap-5">
                    {/* Larger Icon Container for Tight Look */}
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10 transition-colors group-hover:bg-primary/20 group-hover:ring-primary/20">
                        <Icon className="h-6 w-6 text-primary transition-colors group-hover:text-primary-foreground" />
                    </div>

                    <div className="flex flex-col">
                        <h3 className="text-2xl font-bold text-foreground tracking-tight group-hover:text-white transition-colors duration-300">
                            {title}
                        </h3>
                        <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity">
                            {subtitle}
                        </p>
                    </div>
                </div>
            </div>

            <div className="relative z-10 mt-auto flex w-full items-center justify-between pt-6">
                {/* Play Prompt */}
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors duration-300">
                    <span>Play Now</span>
                    <Icons.Play className="h-3 w-3 fill-current" />
                </div>
            </div>
        </SpotlightCard>
    );

    if (disabled) {
        return (
            <div className="relative opacity-50 grayscale cursor-not-allowed">
                {content}
                <div className="absolute inset-x-0 bottom-4 text-center text-[10px] uppercase tracking-widest text-white/40 z-20">Coming Soon</div>
            </div>
        );
    }

    return <Link href={href} className="block w-full">{content}</Link>;
}

export default function Home() {
    return (
        <CurtainReveal>
            <GameLanding />
        </CurtainReveal>
    );
}
