"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function HandleModal({ isOpen, onSubmit }) {
    const [handle, setHandle] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const savedHandle = localStorage.getItem("cineguess_handle");
        if (savedHandle) {
            onSubmit(savedHandle);
        }
    }, [onSubmit]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const cleanHandle = handle.trim().replace("@", "");

        if (!cleanHandle) {
            setError("Enter your handle");
            return;
        }

        if (cleanHandle.length < 2) {
            setError("Too short");
            return;
        }

        localStorage.setItem("cineguess_handle", cleanHandle);
        onSubmit(cleanHandle);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center px-6"
                >
                    {/* Backdrop with blur */}
                    <motion.div
                        initial={{ backdropFilter: "blur(0px)" }}
                        animate={{ backdropFilter: "blur(12px)" }}
                        className="absolute inset-0 bg-black/85"
                    />

                    {/* Ticket stub */}
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.98 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="relative w-full max-w-xs"
                        style={{
                            filter: "drop-shadow(0 25px 50px rgba(0,0,0,0.5))",
                        }}
                    >
                        {/* Main ticket */}
                        <div
                            className="bg-gradient-to-b from-[#1c1c1c] to-[#151515] rounded-xl overflow-hidden border border-white/5"
                            style={{
                                boxShadow: "0 0 0 1px rgba(255,255,255,0.03), 0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
                            }}
                        >
                            {/* Header with perforated edge */}
                            <div className="relative px-6 pt-6 pb-5 border-b border-dashed border-neutral-700/50">
                                <div className="text-center">
                                    <p className="text-neutral-500 text-[10px] uppercase tracking-[0.2em] mb-2">
                                        Admit One
                                    </p>
                                    <h2
                                        className="text-white text-2xl font-display font-semibold tracking-tight"
                                        style={{ textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}
                                    >
                                        CineGuess
                                    </h2>
                                </div>
                                {/* Perforated circles */}
                                <div
                                    className="absolute -left-3 bottom-0 translate-y-1/2 w-6 h-6 rounded-full"
                                    style={{ background: "#0a0a0a", boxShadow: "inset 2px 0 4px rgba(0,0,0,0.3)" }}
                                />
                                <div
                                    className="absolute -right-3 bottom-0 translate-y-1/2 w-6 h-6 rounded-full"
                                    style={{ background: "#0a0a0a", boxShadow: "inset -2px 0 4px rgba(0,0,0,0.3)" }}
                                />
                            </div>

                            {/* Body */}
                            <div className="px-6 py-6">
                                <p className="text-neutral-400 text-sm text-center mb-5">
                                    What should we call you?
                                </p>

                                <form onSubmit={handleSubmit}>
                                    <div
                                        className="relative"
                                        style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}
                                    >
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">
                                            @
                                        </span>
                                        <input
                                            type="text"
                                            value={handle}
                                            onChange={(e) => {
                                                setHandle(e.target.value);
                                                setError("");
                                            }}
                                            placeholder="yourhandle"
                                            autoFocus
                                            maxLength={20}
                                            className="w-full pl-8 pr-4 py-3 bg-black/60 border border-neutral-700/50 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-500 focus:bg-black/80 transition-all font-medium"
                                            style={{
                                                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)",
                                            }}
                                        />
                                    </div>

                                    {error && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-red-400 text-xs text-center mt-3"
                                        >
                                            {error}
                                        </motion.p>
                                    )}

                                    <button
                                        type="submit"
                                        className="w-full mt-5 py-3 bg-white text-black font-semibold rounded-lg hover:bg-neutral-100 active:scale-[0.98] transition-all"
                                        style={{
                                            boxShadow: "0 4px 14px rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.1)",
                                        }}
                                    >
                                        Enter Theater
                                    </button>
                                </form>
                            </div>

                            {/* Footer */}
                            <div className="px-6 pb-5 pt-2">
                                <p className="text-neutral-600 text-[11px] text-center">
                                    Your handle appears on the leaderboard
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
