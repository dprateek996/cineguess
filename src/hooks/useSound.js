"use client";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useSound - Custom hook for game audio effects
 * 
 * Features:
 * - Preloaded sounds for instant playback
 * - Mute toggle persisted to localStorage
 * - Category-specific sound variants
 */

// Sound URLs - using royalty-free sounds encoded as data URIs for simplicity
// In production, replace with actual audio files in /public/sounds/
const SOUNDS = {
    // Success sound - short cheerful chime
    correct: "https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3",
    // Wrong sound - removed per user request
    wrong: "",
    // Stage transition - whoosh
    // Stage transition - removed wind sound
    transition: "",
    // Typewriter key
    typewriter: "https://assets.mixkit.co/active_storage/sfx/2360/2360-preview.mp3",
    // Timer tick
    tick: "https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3",
    // Game start
    start: "https://assets.mixkit.co/active_storage/sfx/2001/2001-preview.mp3",
    // Game over - removed per user request (wind sound)
    gameOver: "",
    // Click/UI interaction
    click: "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3",
};

export function useSound() {
    const [isMuted, setIsMuted] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const audioCache = useRef({});

    // Load mute preference from localStorage
    useEffect(() => {
        const savedMute = localStorage.getItem("cineguess_muted");
        if (savedMute !== null) {
            setIsMuted(savedMute === "true");
        }
    }, []);

    // Preload all sounds
    useEffect(() => {
        if (typeof window === "undefined") return;

        const preloadPromises = Object.entries(SOUNDS).map(([key, url]) => {
            return new Promise((resolve) => {
                const audio = new Audio();
                audio.preload = "auto";
                audio.src = url;
                audio.volume = 0.3; // Default volume
                audioCache.current[key] = audio;
                audio.oncanplaythrough = resolve;
                audio.onerror = resolve; // Don't block on errors
            });
        });

        Promise.all(preloadPromises).then(() => {
            setIsLoaded(true);
        });

        return () => {
            // Cleanup
            Object.values(audioCache.current).forEach((audio) => {
                audio.pause();
                audio.src = "";
            });
        };
    }, []);

    // Play a sound by name
    const play = useCallback((soundName, options = {}) => {
        if (isMuted || typeof window === "undefined") return;

        const audio = audioCache.current[soundName];
        if (!audio) {
            console.warn(`Sound "${soundName}" not found`);
            return;
        }

        // Clone the audio for overlapping sounds
        const sound = audio.cloneNode();
        sound.volume = options.volume ?? 0.3;

        if (options.playbackRate) {
            sound.playbackRate = options.playbackRate;
        }

        sound.play().catch((err) => {
            // Ignore autoplay restrictions
            if (err.name !== "NotAllowedError") {
                console.warn("Sound play failed:", err);
            }
        });

        return sound;
    }, [isMuted]);

    // Toggle mute
    const toggleMute = useCallback(() => {
        setIsMuted((prev) => {
            const newValue = !prev;
            localStorage.setItem("cineguess_muted", String(newValue));
            return newValue;
        });
    }, []);

    // Specific sound helpers
    const playCorrect = useCallback(() => play("correct", { volume: 0.4 }), [play]);
    const playWrong = useCallback(() => play("wrong", { volume: 0.3 }), [play]);
    const playTransition = useCallback(() => play("transition", { volume: 0.2 }), [play]);
    const playClick = useCallback(() => play("click", { volume: 0.15 }), [play]);
    const playStart = useCallback(() => play("start", { volume: 0.3 }), [play]);
    const playGameOver = useCallback(() => play("gameOver", { volume: 0.35 }), [play]);
    const playTick = useCallback(() => play("tick", { volume: 0.1 }), [play]);

    return {
        isMuted,
        isLoaded,
        toggleMute,
        play,
        // Convenience methods
        playCorrect,
        playWrong,
        playTransition,
        playClick,
        playStart,
        playGameOver,
        playTick,
    };
}

export default useSound;
