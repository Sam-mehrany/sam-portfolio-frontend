import { NextRequest, NextResponse } from 'next/server';

async function handler(req: NextRequest) {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!backendUrl) {
        return NextResponse.json({ error: 'Backend URL not configured' }, { status: 500 });
    }

    const targetUrl = `${backendUrl}${req.nextUrl.pathname}`;

    // Create new headers, but forward the essential ones
    const headers = new Headers();
    headers.set('Cookie', req.headers.get('cookie') || '');

    // ✅ CORRECTED: Conditionally set Content-Type
    // For file uploads, forward the original multipart header.
    // Otherwise, assume JSON.
    const contentType = req.headers.get('content-type');
    if (contentType && contentType.includes('multipart/form-data')) {
        // Let fetch set the correct multipart boundary
    } else {
        headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(targetUrl, {
        method: req.method,
        headers: headers, // Pass the corrected headers
        body: req.body,
        redirect: 'manual',
        // @ts-ignore
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
