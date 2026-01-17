import "./globals.css";

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
            <head>
                {/* Fontshare - Clash Display (Headlines) & Satoshi (Body) */}
                <link
                    href="https://api.fontshare.com/v2/css?f[]=clash-display@200,300,400,500,600,700&f[]=satoshi@300,400,500,700&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className="antialiased">
                {children}
            </body>
        </html>
    );
}
