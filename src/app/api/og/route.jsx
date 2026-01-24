import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);

        // Extract params
        const title = searchParams.get('title') || 'Unknown Movie';
        const score = searchParams.get('score') || '0';
        const rank = searchParams.get('rank') || 'Cinephile';
        const posterPath = searchParams.get('poster');
        const mode = searchParams.get('mode') || 'Standard'; // 'Daily' or 'Standard'

        // Font loading (using a robust method for edge)
        // We'll use a simple fetch for Inter Bold
        const fontData = await fetch(
            new URL('https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hjp-Ek-_EeA.woff', import.meta.url)
        ).then((res) => res.arrayBuffer());

        const posterUrl = posterPath
            ? `https://image.tmdb.org/t/p/w500${posterPath}`
            : null;

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'row',
                        backgroundColor: '#09090b', // zinc-950
                        backgroundImage: 'radial-gradient(circle at 25px 25px, #27272a 2%, transparent 0%), radial-gradient(circle at 75px 75px, #27272a 2%, transparent 0%)',
                        backgroundSize: '100px 100px',
                        fontFamily: '"Inter"',
                    }}
                >
                    {/* Left Side: Stats & Branding */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: '60px',
                        width: '60%',
                        height: '100%',
                        borderRight: '1px solid #3f3f46', // zinc-700
                        background: 'linear-gradient(to right, #000000, #18181b)',
                    }}>
                        {/* Header */}
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{
                                fontSize: 24,
                                color: '#fbbf24', // amber-400
                                textTransform: 'uppercase',
                                letterSpacing: '4px',
                                marginBottom: 10,
                                fontWeight: 700
                            }}>
                                CineGuess {mode === 'Daily' ? 'Daily' : ''}
                            </div>
                            <div style={{
                                fontSize: 64,
                                background: 'linear-gradient(to right, #fde68a, #fbbf24)',
                                backgroundClip: 'text',
                                color: 'transparent',
                                fontWeight: 900,
                                lineHeight: 1.1,
                            }}>
                                {rank}
                            </div>
                        </div>

                        {/* Main Stat */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{ color: '#a1a1aa', fontSize: 20, textTransform: 'uppercase', letterSpacing: '2px' }}>Score</div>
                                <div style={{ color: 'white', fontSize: 80, fontWeight: 900, lineHeight: 1 }}>{score}</div>
                            </div>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginTop: 40,
                                padding: '16px 32px',
                                borderRadius: '100px',
                                backgroundColor: '#fbbf24',
                                color: 'black',
                                fontSize: 24,
                                fontWeight: 700,
                                width: 'fit-content'
                            }}>
                                Play Now at CineGuess.com
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Movie Poster */}
                    <div style={{
                        display: 'flex',
                        width: '40%',
                        height: '100%',
                        position: 'relative',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                    }}>
                        {posterUrl ? (
                            <img
                                src={posterUrl}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    opacity: 0.6,
                                    filter: 'blur(10px)',
                                    position: 'absolute',
                                    transform: 'scale(1.2)',
                                }}
                            />
                        ) : null}

                        {posterUrl ? (
                            <img
                                src={posterUrl}
                                style={{
                                    width: '300px',
                                    borderRadius: '16px',
                                    boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
                                    border: '2px solid rgba(255,255,255,0.2)',
                                    zIndex: 10,
                                    transform: 'rotate(-3deg)'
                                }}
                            />
                        ) : (
                            <div style={{
                                fontSize: 40,
                                color: 'white',
                            }}>❓</div>
                        )}

                        {/* Movie Title Overlay */}
                        <div style={{
                            position: 'absolute',
                            bottom: 40,
                            left: 0,
                            right: 0,
                            textAlign: 'center',
                            color: 'white',
                            fontSize: 24,
                            fontWeight: 700,
                            textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                            zIndex: 20,
                            padding: '0 20px'
                        }}>
                            {title}
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
                fonts: [
                    {
                        name: 'Inter',
                        data: fontData,
                        style: 'normal',
                        weight: 700,
                    },
                ],
            },
        );
    } catch (e) {
        return new Response(`Failed to generate image`, { status: 500 });
    }
}
