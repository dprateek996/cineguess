"use client";

import { Component } from "react";
import { Icons } from "@/components/Icons";

/**
 * Error Boundary for graceful error handling in production
 * Catches React rendering errors and shows a user-friendly fallback
 */
export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log to error reporting service in production
        if (process.env.NODE_ENV === "production") {
            // Could send to Sentry, LogRocket, etc.
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-background flex items-center justify-center p-4">
                    <div className="text-center max-w-md">
                        <div className="mb-6 inline-block p-4 rounded-2xl bg-zinc-900/50 border border-white/10">
                            <Icons.Fail className="w-12 h-12 text-red-500/70" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">
                            Something went wrong
                        </h2>
                        <p className="text-muted-foreground text-sm mb-6">
                            The game encountered an error. Please refresh to try again.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-primary text-black rounded-full font-bold uppercase tracking-widest text-xs hover:scale-105 transition-transform"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
