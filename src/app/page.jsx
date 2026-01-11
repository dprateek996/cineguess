"use client";
import { motion } from "framer-motion";
import { CardHoverEffect } from "@/components/ui/card-hover-effect";
import { AnimatedGradient } from "@/components/ui/animated-gradient";

const industries = [
    {
        title: "Bollywood",
        description: "Iconic dialogues, vibrant dance numbers, and masala blockbusters. Can you guess them all?",
        link: "/play/BOLLYWOOD",
        icon: "🎭",
        gradient: "from-orange-500 to-yellow-500",
    },
    {
        title: "Hollywood",
        description: "Global blockbusters, Oscar winners, and high-octane action. Test your knowledge!",
        link: "/play/HOLLYWOOD",
        icon: "🎬",
        gradient: "from-blue-600 to-cyan-400",
    },
    {
        title: "Anime",
        description: "Legendary series, breathtaking visuals, and unforgettable stories from Japan.",
        link: "/play/ANIME",
        icon: "⛩️",
        gradient: "from-purple-600 to-pink-500",
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.3,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

export default function Home() {
    return (
        <AnimatedGradient className="min-h-screen">
            <div className="max-w-6xl mx-auto px-6 py-20 md:py-32">
                {/* Hero Section */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-center mb-16 md:mb-24"
                >
                    {/* Logo/Title */}
                    <motion.div variants={itemVariants} className="mb-6">
                        <span className="text-5xl md:text-6xl">🎥</span>
                    </motion.div>

                    <motion.h1
                        variants={itemVariants}
                        className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 gradient-text"
                    >
                        CineGuess
                    </motion.h1>

                    <motion.p
                        variants={itemVariants}
                        className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-4"
                    >
                        Guess the movie from blurred posters and AI-generated hints.
                        How well do you know cinema?
                    </motion.p>

                    <motion.div
                        variants={itemVariants}
                        className="flex items-center justify-center gap-4 text-sm text-neutral-500"
                    >
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            7 Movies Available
                        </span>
                        <span>•</span>
                        <span>4 Hint Levels</span>
                        <span>•</span>
                        <span>Daily Challenges</span>
                    </motion.div>
                </motion.div>

                {/* Mode Selection */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.h2
                        variants={itemVariants}
                        className="text-2xl md:text-3xl font-semibold text-center mb-10 text-neutral-200"
                    >
                        Pick Your Arena
                    </motion.h2>

                    <motion.div variants={itemVariants}>
                        <CardHoverEffect items={industries} />
                    </motion.div>
                </motion.div>

                {/* How to Play Section */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.8 }}
                    className="mt-24 text-center"
                >
                    <h3 className="text-xl font-semibold text-neutral-300 mb-8">How It Works</h3>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[
                            { step: "1", title: "Blurred Poster", desc: "Start with a heavily blurred movie poster" },
                            { step: "2", title: "Unlock Hints", desc: "Each wrong guess reveals a new hint" },
                            { step: "3", title: "Guess the Movie", desc: "Type your answer - typos allowed!" },
                            { step: "4", title: "Score Points", desc: "Fewer hints = Higher score" },
                        ].map((item) => (
                            <motion.div
                                key={item.step}
                                className="glass rounded-xl p-5 text-center"
                                whileHover={{ scale: 1.02 }}
                            >
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                                    {item.step}
                                </div>
                                <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                                <p className="text-sm text-neutral-400">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Footer */}
                <motion.footer
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.3 }}
                    className="mt-24 text-center text-sm text-neutral-500"
                >
                    <p>Built with ❤️ using Next.js, NeonDB, and TMDB</p>
                </motion.footer>
            </div>
        </AnimatedGradient>
    );
}
