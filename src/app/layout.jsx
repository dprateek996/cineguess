import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
    variable: "--font-plus-jakarta",
    subsets: ["latin"],
});

export const metadata = {
    title: "CineGuess - Movie Guessing Game",
    description: "Guess movies from blurred posters and AI-generated hints. Test your cinema knowledge with Bollywood, Hollywood, and Anime challenges!",
    keywords: ["movie", "guessing game", "bollywood", "hollywood", "anime", "trivia"],
    openGraph: {
        title: "CineGuess - Movie Guessing Game",
        description: "Can you guess the movie from blurred posters?",
        type: "website",
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className="dark">
            <body className={`${inter.variable} ${plusJakarta.variable} antialiased`}>
                {children}
            </body>
        </html>
    );
}
