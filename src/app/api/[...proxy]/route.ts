// Corrected code for: api/[..proxy]/route.ts

import { NextRequest, NextResponse } from 'next/server';

async function handler(req: NextRequest) {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!backendUrl) {
        return NextResponse.json({ error: 'Backend URL not configured' }, { status: 500 });
    }

    const targetUrl = `${backendUrl}${req.nextUrl.pathname}`;

    // FIX: Clone the headers from the incoming request instead of creating a new object.
    // This preserves the original Content-Type, which is crucial for file uploads.
    const requestHeaders = new Headers(req.headers);
    requestHeaders.delete('host'); // The 'host' header is set automatically by fetch.

    const response = await fetch(targetUrl, {
        method: req.method,
        headers: requestHeaders, // Use the forwarded headers
        body: req.body,
        redirect: 'manual',
        duplex: 'half' // Necessary for streaming the body in Next.js
    } as any);

    // Forward the 'set-cookie' header from the backend to the client for authentication.
    const responseHeaders = new Headers();
    if (response.headers.has('set-cookie')) {
        responseHeaders.set('set-cookie', response.headers.get('set-cookie')!);
    }

    return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
    });
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE };
