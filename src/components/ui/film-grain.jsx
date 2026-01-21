"use client";

import React from "react";

export const FilmGrain = ({ opacity = 0.04 }) => (
    <div
        className="pointer-events-none fixed inset-0 z-50 mix-blend-soft-light"
        style={{
            opacity: opacity,
            backgroundImage: `url('/noise.png')`,
            backgroundRepeat: "repeat",
        }}
    />
);
