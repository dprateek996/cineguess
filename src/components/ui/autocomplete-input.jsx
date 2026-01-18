"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * AutocompleteInput - "Tactile Console" Input
 * 
 * Features:
 * - Glassmorphism 2.0 (Deep dark glass)
 * - Radial Flare on Focus
 * - Debounced API search
 * - Keyboard navigation
 */
export default function AutocompleteInput({
    value,
    onChange,
    onSubmit,
    placeholder = "Enter movie name...",
    industry = "HOLLYWOOD",
    disabled = false,
    className = "",
    shakeOnError = false,
}) {
    const [suggestions, setSuggestions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef(null);
    const debounceRef = useRef(null);
    const containerRef = useRef(null);

    // Fetch suggestions from API
    const fetchSuggestions = useCallback(async (query) => {
        if (!query || query.length < 2) {
            setSuggestions([]);
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`/api/movies/search?q=${encodeURIComponent(query)}&industry=${industry}`);
            if (res.ok) {
                const data = await res.json();
                setSuggestions(data.movies || []);
                setIsOpen(true);
            }
        } catch (err) {
            console.error("Autocomplete fetch error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [industry]);

    // Debounced search
    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (value.length >= 2) {
            debounceRef.current = setTimeout(() => {
                fetchSuggestions(value);
            }, 200);
        } else {
            setSuggestions([]);
            setIsOpen(false);
        }

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [value, fetchSuggestions]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handle keyboard navigation
    const handleKeyDown = (e) => {
        if (!isOpen || suggestions.length === 0) {
            if (e.key === "Enter") {
                e.preventDefault();
                onSubmit?.(e);
            }
            return;
        }

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev < suggestions.length - 1 ? prev + 1 : 0
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev > 0 ? prev - 1 : suggestions.length - 1
                );
                break;
            case "Enter":
                e.preventDefault();
                if (selectedIndex >= 0 && suggestions[selectedIndex]) {
                    selectSuggestion(suggestions[selectedIndex]);
                } else {
                    onSubmit?.(e);
                }
                break;
            case "Escape":
                setIsOpen(false);
                setSelectedIndex(-1);
                break;
        }
    };

    // Select a suggestion
    const selectSuggestion = (movie) => {
        onChange({ target: { value: movie.title } });
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.focus();
    };

    // Highlight matching text in suggestion
    const highlightMatch = (text, query) => {
        if (!query) return text;
        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        const parts = text.split(regex);
        return parts.map((part, i) =>
            regex.test(part) ? (
                <span key={i} className="text-amber-400 font-semibold">{part}</span>
            ) : part
        );
    };

    return (
        <div ref={containerRef} className={`relative group ${className}`}>

            {/* Input Container with "Tactile" Glassmorphism */}
            <div className={`
                relative bg-black/40 backdrop-blur-xl rounded-2xl 
                border-white/10
                transition-all duration-300
                group-focus-within:bg-black/60 group-focus-within:border-white/20
                ${shakeOnError ? "border-red-500/50 bg-red-900/10 animate-shake" : "border"}
            `}>

                {/* Radial Flare (Focus State) */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                    <div className="absolute -inset-full bg-gradient-to-r from-transparent via-blue-500/10 to-transparent blur-xl opacity-0 group-focus-within:animate-flare" />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity" />
                </div>

                <div className="relative flex items-center">
                    <input
                        ref={inputRef}
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => suggestions.length > 0 && setIsOpen(true)}
                        placeholder={placeholder}
                        disabled={disabled}
                        autoComplete="off"
                        className={`
                            bg-transparent border-none outline-none ring-0 
                            text-white placeholder:text-neutral-600
                            w-full h-12 px-5 font-medium tracking-wide
                        `}
                    />

                    {/* Loading indicator */}
                    {isLoading && (
                        <div className="absolute right-4">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-4 h-4 border-2 border-neutral-600 border-t-amber-500 rounded-full"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Suggestions dropdown */}
            <AnimatePresence>
                {isOpen && suggestions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full mb-3 left-0 right-0 py-2 rounded-xl bg-black/80 backdrop-blur-xl border border-white/10 max-h-60 overflow-y-auto z-50 shadow-2xl shadow-black/80"
                    >
                        {suggestions.map((movie, index) => (
                            <motion.button
                                key={movie.id || index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.03 }}
                                onClick={() => selectSuggestion(movie)}
                                className={`
                                    w-full px-4 py-2.5 text-left flex items-center gap-3
                                    transition-colors
                                    ${selectedIndex === index
                                        ? "bg-white/10 text-white"
                                        : "text-neutral-400 hover:bg-white/5 hover:text-neutral-200"
                                    }
                                `}
                            >
                                {movie.posterPath && (
                                    <img
                                        src={`https://image.tmdb.org/t/p/w92${movie.posterPath}`}
                                        alt=""
                                        className="w-6 h-9 object-cover rounded shadow-sm opacity-80"
                                    />
                                )}

                                <div className="flex-1 min-w-0">
                                    <p className="truncate text-sm font-medium">
                                        {highlightMatch(movie.title, value)}
                                    </p>
                                    {movie.releaseYear && (
                                        <p className="text-[10px] text-neutral-600">
                                            {movie.releaseYear}
                                        </p>
                                    )}
                                </div>
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
