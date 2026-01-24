
export const Icons = {
    // --- Industries ---

    // Bollywood: Popcorn Bucket (simplified)
    Bollywood: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
            {/* Bucket */}
            <path d="M5 8h14l-2 13H7L5 8z" />
            {/* Popcorn kernels on top */}
            <circle cx="8" cy="6" r="2" />
            <circle cx="12" cy="5" r="2.5" />
            <circle cx="16" cy="6" r="2" />
            <circle cx="10" cy="4" r="1.5" />
            <circle cx="14" cy="3.5" r="1.5" />
            {/* Floating kernels */}
            <circle cx="6" cy="3" r="1" />
            <circle cx="18" cy="2" r="1" />
        </svg>
    ),

    // Hollywood: The Star-Beam
    Hollywood: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" strokeLinejoin="round" />
            <path d="M4 22l4-4M20 22l-4-4" strokeLinecap="round" />
        </svg>
    ),

    // Anime: The Katana Slash
    Anime: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
            <path d="M20 4L4 20M17 10l3-3M10 17l3-3" strokeLinecap="round" />
            <circle cx="12" cy="12" r="1" fill="currentColor" />
        </svg>
    ),

    // Global: The Compass Prism
    Global: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M12 2l10 10-10 10L2 12z" />
            <path d="M12 7v10" />
            <path d="M7 12h10" />
            <circle cx="12" cy="12" r="1" fill="currentColor" />
        </svg>
    ),

    // --- Game Modes ---

    // Classic: The Film Reel
    Classic: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="3" />
            <path d="M12 3v6M12 15v6M3 12h6M15 12h6" strokeLinecap="round" />
        </svg>
    ),

    // Rapid Fire: The Lightning Pulse
    RapidFire: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),

    // Daily Challenge: The Award Statuette
    Daily: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M8 21h8" />
            <path d="M12 17v4" />
            <path d="M7 4h10" />
            <path d="M9 4v8a3 3 0 0 0 6 0V4" />
            <path d="M7 7H5a2 2 0 0 0-2 2v2a1 1 0 0 0 1 1h3" />
            <path d="M17 7h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1h-3" />
        </svg>
    ),

    // --- UI Elements ---

    // Play Button: Triangle in Circle
    Play: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <circle cx="12" cy="12" r="10" />
            <path d="M10 8l6 4-6 4V8z" fill="currentColor" opacity="0.8" />
        </svg>
    ),

    // Success: Golden Frame (Double Square)
    Success: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <rect x="7" y="7" width="10" height="10" rx="1" />
            <path d="M9 12l2 2 4-4" />
        </svg>
    ),

    // Fail: Burned Film (Jagged X)
    Fail: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
            <path d="M2.5 12l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1 1.5 0" opacity="0.3" transform="rotate(90 12 12) translate(0 10)" />
        </svg>
    ),

    // Generic fallback if needed
    Loading: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M12 2v4" />
            <path d="M12 18v4" />
            <path d="M4.93 4.93l2.83 2.83" />
            <path d="M16.24 16.24l2.83 2.83" />
            <path d="M2 12h4" />
            <path d="M18 12h4" />
            <path d="M4.93 19.07l2.83-2.83" />
            <path d="M16.24 7.76l2.83-2.83" />
        </svg>
    ),

    // Logo: Custom Movie Camera (Tripod + Reels)
    Projector: (props) => (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
            {/* Rear Reel */}
            <path d="M7 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm0 2a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
            {/* Front Reel (Larger) */}
            <path d="M15 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
            {/* Body Box */}
            <path d="M4 10h12v8H4z" />
            {/* Lens */}
            <path d="M16 12l6-3v10l-6-3v-4z" />
            {/* Tripod Legs */}
            <path d="M10 18l-3 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M14 18l3 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 18v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    ),

    // Download Icon
    Download: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
    )
};
