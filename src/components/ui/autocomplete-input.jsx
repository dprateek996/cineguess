"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * AutocompleteInput - Smart movie title input with fuzzy search
 * 
 * Features:
 * - Debounced API search
 * - Keyboard navigation (↑/↓/Enter/Esc)
 * - Mobile-friendly tap selection
 * - Highlights matching text
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
        <div ref={containerRef} className={`relative ${className}`}>
            {/* Input field */}
            <div className="relative">
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
                        input-game w-full pr-10
                        ${shakeOnError ? "animate-shake" : ""}
                    `}
                />

                {/* Loading indicator */}
                {isLoading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-neutral-600 border-t-amber-500 rounded-full"
                        />
                    </div>
                )}
            </div>

            {/* Suggestions dropdown */}
            <AnimatePresence>
                {isOpen && suggestions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 w-full mt-2 py-2 rounded-xl glass border border-neutral-700/50 max-h-60 overflow-y-auto"
                        style={{
                            boxShadow: "0 10px 40px rgba(0,0,0,0.4)"
                        }}
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
                                        ? "bg-neutral-700/50 text-white"
                                        : "text-neutral-300 hover:bg-neutral-800/50 hover:text-white"
                                    }
                                `}
                            >
                                {/* Movie poster thumbnail */}
                                {movie.posterPath && (
                                    <img
                                        src={`https://image.tmdb.org/t/p/w92${movie.posterPath}`}
                                        alt=""
                                        className="w-8 h-12 object-cover rounded"
                                    />
                                )}

                                <div className="flex-1 min-w-0">
                                    <p className="truncate text-sm">
                                        {highlightMatch(movie.title, value)}
                                    </p>
                                    {movie.releaseYear && (
                                        <p className="text-xs text-neutral-500">
                                            {movie.releaseYear}
                                        </p>
                                    )}
                                </div>
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* No results message */}
            <AnimatePresence>
                {isOpen && !isLoading && suggestions.length === 0 && value.length >= 2 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute z-50 w-full mt-2 py-3 px-4 rounded-xl glass border border-neutral-700/50 text-center text-neutral-500 text-sm"
                    >
                        No movies found
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
