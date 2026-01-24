import { Analytics } from "@vercel/analytics/next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: "CineQuest - Movie Guessing Game",
    description: "Guess movies from blurred posters and AI-generated hints. Test your cinema knowledge with Bollywood, Hollywood, and Anime challenges!",
    keywords: ["movie", "guessing game", "bollywood", "hollywood", "anime", "trivia"],
    icons: {
        icon: '/favicon.svg',
    },
    openGraph: {
        title: "CineQuest - Movie Guessing Game",
        description: "Can you guess the movie from blurred posters?",
        type: "website",
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className="dark">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                {children}
                <Analytics />
            </body>
        </html>
    );
}
