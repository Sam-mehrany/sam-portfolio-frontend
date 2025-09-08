import { NextRequest, NextResponse } from 'next/server';

async function handler(req: NextRequest) {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!backendUrl) {
        return NextResponse.json({ error: 'Backend URL not configured' }, { status: 500 });
    }

    const targetUrl = `${backendUrl}${req.nextUrl.pathname}`;

    // Create new headers and forward the essential ones
    const headers = new Headers();
    headers.set('Cookie', req.headers.get('cookie') || '');

    // Conditionally set Content-Type
    // For file uploads, we let the browser set the correct multipart header.
    // Otherwise, we assume JSON.
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(targetUrl, {
        method: req.method,
        headers: headers, // Pass the corrected headers
        body: req.body,
        redirect: 'manual',
        // @ts-ignore - duplex is required for streaming bodies in newer Node versions
        duplex: 'half'
    });

    // Create a new response and copy the headers from the backend
    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
        if (key.toLowerCase() === 'set-cookie') {
            responseHeaders.append(key, value);
        }
    });

    return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
    });
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE };
