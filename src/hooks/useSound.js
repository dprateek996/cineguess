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
    // Sound URLs - mapped to uploaded files
    correct: "/sounds/chime-sound-7143.mp3",
    wrong: "/sounds/wrong-47985.mp3",
    win: "/sounds/fanfare-46385.mp3",
    lose: "/sounds/negative_beeps-6008.mp3",

    // UI Sounds
    typewriter: "/sounds/single-key-press-393908.mp3",
    tick: "/sounds/clock-ticking-sound-effect-240503.mp3",
    clock: "/sounds/clock-ticking-sound-effect-240503.mp3",

    // Note: Other UI sounds (hover, click, etc.) are commented out 
    // because the files are not present in public/sounds/
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

        console.log(`[useSound] Playing: ${soundName}`); // DEBUG LOG

        const audio = audioCache.current[soundName];
        if (!audio) {
            // Silent fail for missing sounds
            return;
        }

        // Clone the audio for overlapping sounds
        const sound = audio.cloneNode();
        sound.volume = options.volume ?? 0.3; // Increased default volume

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

    // Specific sound helpers - BOOSTED VOLUMES
    const playCorrect = useCallback(() => play("correct", { volume: 0.5 }), [play]);
    const playWrong = useCallback(() => play("wrong", { volume: 0.4 }), [play]);
    const playWin = useCallback(() => play("win", { volume: 0.5 }), [play]);
    const playLose = useCallback(() => play("lose", { volume: 0.5 }), [play]);
    const playTypewriter = useCallback(() => play("typewriter", { volume: 0.25, playbackRate: 1.5 }), [play]);
    const playTick = useCallback(() => play("tick", { volume: 0.2 }), [play]);
    // Alias playTransition to click/typewriter sound to prevent crashes, but not "tick" (too urgent)
    const playTransition = useCallback(() => play("typewriter", { volume: 0.1, playbackRate: 2.0 }), [play]);
    const playGameOver = useCallback(() => play("lose", { volume: 0.5 }), [play]); // Ensure this exists too

    return {
        isMuted,
        isLoaded,
        toggleMute,
        play,
        // Convenience methods
        playCorrect,
        playWrong,
        playWin,
        playLose,
        playTypewriter,
        playTick,
        playTransition,
        playGameOver
    };
}

export default useSound;
