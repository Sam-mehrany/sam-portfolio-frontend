import { NextRequest, NextResponse } from 'next/server';

async function handler(req: NextRequest) {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!backendUrl) {
        return NextResponse.json({ error: 'Backend URL not configured' }, { status: 500 });
    }

    const targetUrl = `${backendUrl}${req.nextUrl.pathname}`;

    const response = await fetch(targetUrl, {
        method: req.method,
        headers: {
            'Content-Type': 'application/json',
            'Cookie': req.headers.get('cookie') || '',
        },
        body: req.body,
        redirect: 'manual',
        duplex: 'half'
    } as any); // ✅ ADD THIS CAST

    const headers = new Headers();
    response.headers.forEach((value, key) => {
        if (key.toLowerCase() === 'set-cookie') {
            headers.append(key, value);
        }
    });

    return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
    });
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE };
