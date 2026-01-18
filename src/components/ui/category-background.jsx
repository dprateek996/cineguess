"use client";
import { useEffect, useRef, memo } from "react";
import { motion } from "framer-motion";

/**
 * CategoryBackground - Immersive animated backgrounds per industry
 * 
 * Hollywood: Moving searchlight beams
 * Bollywood: Golden particle sparkles
 * Anime: Floating cherry blossom petals
 */

const CategoryBackground = memo(function CategoryBackground({
    industry = "HOLLYWOOD",
    className = ""
}) {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const particlesRef = useRef([]);

    // Check for reduced motion preference
    const prefersReducedMotion = typeof window !== 'undefined'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;

    useEffect(() => {
        if (prefersReducedMotion) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        const resize = () => {
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
            ctx.scale(dpr, dpr);
        };

        resize();
        window.addEventListener('resize', resize);

        // Initialize particles based on industry
        const initParticles = () => {
            const count = industry === 'ANIME' ? 25 : industry === 'BOLLYWOOD' ? 40 : 0;
            particlesRef.current = [];

            for (let i = 0; i < count; i++) {
                if (industry === 'ANIME') {
                    // Cherry blossom petals
                    particlesRef.current.push({
                        x: Math.random() * window.innerWidth,
                        y: Math.random() * window.innerHeight - window.innerHeight,
                        size: Math.random() * 12 + 8,
                        speedY: Math.random() * 0.8 + 0.3,
                        speedX: Math.random() * 0.4 - 0.2,
                        rotation: Math.random() * 360,
                        rotationSpeed: (Math.random() - 0.5) * 2,
                        opacity: Math.random() * 0.4 + 0.3,
                    });
                } else if (industry === 'BOLLYWOOD') {
                    // Golden sparkles
                    particlesRef.current.push({
                        x: Math.random() * window.innerWidth,
                        y: Math.random() * window.innerHeight,
                        size: Math.random() * 3 + 1,
                        speedY: Math.random() * 0.3 + 0.1,
                        twinkleSpeed: Math.random() * 0.02 + 0.01,
                        twinklePhase: Math.random() * Math.PI * 2,
                        opacity: 0,
                    });
                }
            }
        };

        initParticles();

        // Hollywood searchlight properties
        let lightAngle1 = 0;
        let lightAngle2 = Math.PI * 0.7;

        const animate = () => {
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

            if (industry === 'HOLLYWOOD') {
                // Searchlight beams
                const centerX = window.innerWidth / 2;
                const centerY = window.innerHeight + 100;
                const beamLength = Math.max(window.innerWidth, window.innerHeight) * 1.5;

                // First beam
                lightAngle1 += 0.003;
                const beam1X = centerX + Math.sin(lightAngle1) * beamLength * 0.3;
                drawSearchlight(ctx, centerX - 200, centerY, lightAngle1 - Math.PI / 2, beamLength, '#3b82f6');

                // Second beam
                lightAngle2 += 0.002;
                drawSearchlight(ctx, centerX + 200, centerY, lightAngle2 - Math.PI / 2, beamLength, '#22d3ee');

            } else if (industry === 'BOLLYWOOD') {
                // Golden sparkles
                particlesRef.current.forEach((p, i) => {
                    p.y -= p.speedY;
                    p.twinklePhase += p.twinkleSpeed;
                    p.opacity = Math.sin(p.twinklePhase) * 0.5 + 0.5;

                    if (p.y < -10) {
                        p.y = window.innerHeight + 10;
                        p.x = Math.random() * window.innerWidth;
                    }

                    // Draw sparkle
                    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
                    gradient.addColorStop(0, `rgba(251, 191, 36, ${p.opacity * 0.8})`);
                    gradient.addColorStop(0.5, `rgba(249, 115, 22, ${p.opacity * 0.4})`);
                    gradient.addColorStop(1, 'transparent');

                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
                    ctx.fillStyle = gradient;
                    ctx.fill();

                    // Cross sparkle
                    ctx.strokeStyle = `rgba(251, 191, 36, ${p.opacity * 0.6})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(p.x - p.size, p.y);
                    ctx.lineTo(p.x + p.size, p.y);
                    ctx.moveTo(p.x, p.y - p.size);
                    ctx.lineTo(p.x, p.y + p.size);
                    ctx.stroke();
                });

            } else if (industry === 'ANIME') {
                // Cherry blossom petals
                particlesRef.current.forEach((p) => {
                    p.y += p.speedY;
                    p.x += p.speedX + Math.sin(p.y * 0.01) * 0.3;
                    p.rotation += p.rotationSpeed;

                    if (p.y > window.innerHeight + 20) {
                        p.y = -20;
                        p.x = Math.random() * window.innerWidth;
                    }

                    // Draw petal
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate((p.rotation * Math.PI) / 180);
                    ctx.globalAlpha = p.opacity;

                    // Petal shape
                    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
                    gradient.addColorStop(0, '#fce7f3');
                    gradient.addColorStop(0.7, '#f9a8d4');
                    gradient.addColorStop(1, '#ec4899');

                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.ellipse(0, 0, p.size * 0.5, p.size, 0, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.restore();
                });
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resize);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [industry, prefersReducedMotion]);

    // Helper: Draw searchlight beam
    function drawSearchlight(ctx, x, y, angle, length, color) {
        const spread = 0.15;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, length);
        gradient.addColorStop(0, `${color}15`);
        gradient.addColorStop(0.5, `${color}08`);
        gradient.addColorStop(1, 'transparent');

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(-spread) * length, Math.sin(-spread) * length);
        ctx.lineTo(Math.cos(spread) * length, Math.sin(spread) * length);
        ctx.closePath();

        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.restore();
    }

    if (prefersReducedMotion) {
        // Static gradient fallback
        const gradients = {
            HOLLYWOOD: 'radial-gradient(ellipse at 50% 100%, rgba(59,130,246,0.1) 0%, transparent 60%)',
            BOLLYWOOD: 'radial-gradient(ellipse at 50% 50%, rgba(249,115,22,0.08) 0%, transparent 50%)',
            ANIME: 'radial-gradient(ellipse at 50% 0%, rgba(236,72,153,0.08) 0%, transparent 60%)',
            GLOBAL: 'radial-gradient(ellipse at 50% 50%, rgba(16,185,129,0.08) 0%, transparent 50%)',
        };

        return (
            <div
                className={`fixed inset-0 pointer-events-none ${className}`}
                style={{ background: gradients[industry] || gradients.HOLLYWOOD }}
            />
        );
    }

    return (
        <motion.canvas
            ref={canvasRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className={`fixed inset-0 pointer-events-none ${className}`}
            style={{ zIndex: 0 }}
        />
    );
});

export default CategoryBackground;
