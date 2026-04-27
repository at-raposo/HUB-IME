import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        const title = searchParams.has('title')
            ? searchParams.get('title')?.slice(0, 100)
            : 'Arquivo Lab-Div';

        const category = searchParams.get('category') || 'Hub de Comunicação Científica';

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        backgroundColor: '#0f172a',
                        padding: '100px',
                    }}
                >
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '24px',
                        marginBottom: '48px'
                    }}>
                        <div style={{ display: 'flex', width: '32px', height: '32px', borderRadius: '4px', backgroundColor: '#e63946' }}></div>
                        <div style={{ display: 'flex', width: '32px', height: '32px', borderRadius: '4px', backgroundColor: '#4361ee' }}></div>
                        <div style={{ display: 'flex', width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#ffb703' }}></div>
                        <h2 style={{ fontSize: '36px', color: '#ffb703', textTransform: 'uppercase', letterSpacing: '4px', fontWeight: 800, marginLeft: '16px' }}>
                            {category}
                        </h2>
                    </div>
                    <div
                        style={{
                            fontSize: '76px',
                            fontWeight: 900,
                            letterSpacing: '-2px',
                            lineHeight: 1.1,
                            color: 'white',
                            marginBottom: '48px',
                            maxWidth: '950px'
                        }}
                    >
                        {title}
                    </div>
                    <div style={{ display: 'flex', color: '#94a3b8', fontSize: '28px', fontWeight: 600 }}>
                        Instituto de Física • USP
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            },
        );
    } catch (e: any) {
        console.error('Failed to generate OG image:', e);
        return new Response('Failed to generate image', { status: 500 });
    }
}
