import Link from 'next/link';
import { Icons } from '@/components/Icons';

export async function generateMetadata({ searchParams }) {
    const { title, score, rank, poster, mode } = searchParams;

    const ogUrl = new URL(`${process.env.NEXT_PUBLIC_APP_URL || 'https://cinequest.com'}/api/og`);
    if (title) ogUrl.searchParams.set('title', title);
    if (score) ogUrl.searchParams.set('score', score);
    if (rank) ogUrl.searchParams.set('rank', rank);
    if (poster) ogUrl.searchParams.set('poster', poster);
    if (mode) ogUrl.searchParams.set('mode', mode);

    return {
        title: `Can you beat my score on CineQuest?`,
        description: `I scored ${score} pts and got the rank of ${rank} guessing ${title}. Play now!`,
        openGraph: {
            title: `I identified ${title} on CineQuest!`,
            description: `Score: ${score} | Rank: ${rank}`,
            images: [
                {
                    url: ogUrl.toString(),
                    width: 1200,
                    height: 630,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: `I identified ${title} on CineQuest!`,
            description: `Score: ${score} | Rank: ${rank}`,
            images: [ogUrl.toString()],
        },
    };
}

export default function SharePage({ searchParams }) {
    const { score, rank, title } = searchParams;

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Dynamic Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-800 via-black to-black opacity-50" />
            <div className="absolute inset-0" style={{ backgroundImage: 'url("/noise.png")', opacity: 0.05 }} />

            <div className="relative z-10 max-w-md w-full bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center shadow-2xl">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-amber-400 rounded-2xl flex items-center justify-center shadow-[0_0_30px_-5px_rgba(251,191,36,0.6)] rotate-3">
                        <Icons.Classic className="w-8 h-8 text-black" />
                    </div>
                </div>

                <h1 className="text-3xl font-black text-white mb-2 tracking-tight">CineQuest Challenge</h1>
                <p className="text-zinc-400 mb-8 text-sm">
                    A player just identified <span className="text-white font-bold">"{title}"</span> and scored <span className="text-amber-400 font-bold">{score}</span> points!
                </p>

                <div className="bg-white/5 rounded-xl p-4 mb-8 border border-white/5">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Their Rank</p>
                    <p className="text-2xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">
                        {rank}
                    </p>
                </div>

                <Link
                    href="/"
                    className="block w-full py-4 bg-amber-400 hover:bg-amber-300 text-black rounded-xl font-bold uppercase tracking-widest text-sm transition-all hover:scale-[1.02] shadow-[0_0_20px_-5px_rgba(251,191,36,0.5)]"
                >
                    Accept Challenge
                </Link>

                <p className="mt-6 text-[10px] text-zinc-600 uppercase tracking-widest">
                    Test your movie knowledge
                </p>
            </div>
        </div>
    );
}
