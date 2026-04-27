import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return new NextResponse('Missing URL parameter', { status: 400 });
    }

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'IF-USP-Ciencia/1.0',
            }
        });

        if (!response.ok) {
            return new NextResponse('Failed to fetch image', { status: response.status });
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const headers = new Headers();

        headers.set('Content-Type', response.headers.get('Content-Type') || 'image/jpeg');
        // Cache na Vercel CDN/Browser: s-maxage (CDN) 1 dia, stale-while-revalidate 7 dias
        headers.set('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');

        return new NextResponse(buffer, {
            status: 200,
            headers,
        });
    } catch (error) {
        console.error('Error proxying avatar:', error);
        return new NextResponse('Error fetching avatar', { status: 500 });
    }
}
