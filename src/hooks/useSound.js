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
    // Use local paths to avoid external 403 errors
    correct: "/sounds/correct.mp3",
    wrong: "/sounds/wrong.mp3",
    win: "/sounds/win.mp3",
    lose: "/sounds/lose.mp3",

    // UI Sounds
    typewriter: "/sounds/typewriter.mp3",
    reveal: "/sounds/reveal.mp3",
    tick: "/sounds/tick.mp3",
    clock: "/sounds/clock.mp3",
    start: "/sounds/start.mp3",
    hover: "/sounds/hover.mp3",
    click: "/sounds/click.mp3",
    select: "/sounds/select.mp3",
};

export function useSound() {
    const [isMuted, setIsMuted] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const audioCache = useRef({});

    // Load mute preference from localStorage
    useEffect(() => {
        const savedMute = localStorage.getItem("cinequest_muted");
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
            localStorage.setItem("cinequest_muted", String(newValue));
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
