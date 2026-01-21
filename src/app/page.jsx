"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Calendar, ArrowRight, Play } from "lucide-react";
import CurtainReveal from "@/components/ui/curtain-reveal";
import { CinematicBackground } from "@/components/ui/cinematic-background";
import { LampContainer } from "@/components/ui/lamp-effect";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const modes = [
    { id: "BOLLYWOOD", name: "Bollywood", tagline: "Masala & Magic", color: "var(--bollywood-from)" },
    { id: "HOLLYWOOD", name: "Hollywood", tagline: "Blockbusters", color: "var(--hollywood-from)" },
    { id: "ANIME", name: "Anime", tagline: "Ghibli & More", color: "var(--anime-from)" },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.3
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
};

function GameLanding() {
    return (
        <div className="h-screen w-full bg-background flex flex-col items-center justify-center relative overflow-hidden font-body">
            <CinematicBackground />

            {/* Lamp Effect - Layered & Diffused */}
            <div className="absolute top-0 w-full z-0 flex justify-center -translate-y-40 md:-translate-y-20 pointer-events-none">
                <LampContainer className="w-full md:w-[60rem] h-[40rem] bg-transparent !min-h-0" />
            </div>

            <motion.main
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex-1 flex flex-col items-center justify-center relative z-10 w-full max-w-5xl px-4"
            >

                {/* Hero Typography - Refined Vertical Rhythm */}
                <motion.div variants={itemVariants} className="text-center mb-10 relative pt-20 md:pt-0">
                    <div className="relative flex flex-col items-center justify-center">
                        <h1 className="font-display font-bold leading-[0.85] tracking-tighter text-center">
                            {/* CINE - Solid & Top Layer */}
                            <span className="block text-[5rem] md:text-[8rem] lg:text-[10rem] text-white z-20 relative drop-shadow-2xl">
                                CINE
                            </span>

                            {/* GUESS - Outlined & Tucked Under */}
                            <span
                                className="block text-[5rem] md:text-[8rem] lg:text-[10rem] text-transparent z-10 relative -mt-4 md:-mt-8 opacity-90"
                                style={{
                                    WebkitTextStroke: "1.5px var(--primary)",
                                    fontFamily: "var(--font-display)"
                                }}
                            >
                                GUESS
                            </span>
                        </h1>

                        {/* Subtle Ambient Glow behind text */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/10 blur-[120px] -z-10 rounded-full" />
                    </div>

                    <p className="text-muted-foreground text-sm md:text-base font-medium tracking-[0.2em] uppercase mt-8 max-w-md mx-auto opacity-80">
                        Frame-by-Frame Trivia
                    </p>
                </motion.div>

                {/* Mode Selection - Premium Cards */}
                <motion.div variants={itemVariants} className="w-full max-w-4xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        {modes.map((mode) => (
                            <Link key={mode.id} href={`/play/${mode.id}`} className="block h-full cursor-pointer">
                                <motion.div
                                    whileHover={{ scale: 1.02, y: -5 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    className="h-full"
                                >
                                    <Card className="group relative h-full overflow-hidden bg-white/[0.03] backdrop-blur-xl border-white/10 hover:border-primary/50 hover:bg-white/[0.06] transition-all duration-500 flex flex-col justify-between p-6 rounded-2xl shadow-2xl ring-1 ring-white/5">

                                        {/* Gradient Border Effect via inset shadow or overlay */}
                                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_70%)] opacity-20 group-hover:opacity-30 blur-2xl" />

                                        <div className="mb-4 relative z-10">
                                            {/* Icon Squircle */}
                                            <div
                                                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 shadow-[0_0_20px_-5px_rgba(0,0,0,0.5)] border border-white/10"
                                                style={{
                                                    backgroundColor: `${mode.color}15`, // Very subtle tint
                                                    boxShadow: `0 0 20px ${mode.color}20` // Subtle color glow
                                                }}
                                            >
                                                <Play
                                                    className="w-5 h-5 fill-current transition-colors duration-300"
                                                    style={{ color: mode.color }}
                                                />
                                            </div>

                                            <h3 className="text-white font-display font-bold text-2xl leading-tight mb-2 tracking-tight group-hover:text-primary transition-colors duration-300">
                                                {mode.name}
                                            </h3>
                                            <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest opacity-70 group-hover:opacity-100 transition-opacity">
                                                {mode.tagline}
                                            </p>
                                        </div>

                                        <div className="self-end opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0 relative z-10">
                                            <ArrowRight className="w-5 h-5 text-primary" />
                                        </div>
                                    </Card>
                                </motion.div>
                            </Link>
                        ))}
                    </div>

                    {/* Daily Challenge - Polished Button */}
                    <motion.div variants={itemVariants} className="flex justify-center">
                        <Link href="/daily">
                            <Button
                                variant="outline"
                                className="h-12 bg-amber-500/5 text-amber-500 border-amber-500/20 hover:bg-amber-500/10 hover:border-amber-500/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] px-8 rounded-full text-xs uppercase tracking-widest font-bold transition-all duration-300"
                            >
                                <Calendar className="w-4 h-4 mr-2" />
                                Daily Challenge
                            </Button>
                        </Link>
                    </motion.div>
                </motion.div>

            </motion.main>
        </div>
    );
}

export default function Home() {
    return (
        <CurtainReveal>
            <GameLanding />
        </CurtainReveal>
    );
}
