import { NextRequest, NextResponse } from 'next/server';

// This function will handle all requests to /api/*
async function handler(req: NextRequest) {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!backendUrl) {
        return NextResponse.json({ error: 'Backend URL not configured' }, { status: 500 });
    }

    // Reconstruct the target URL to the real backend
    const path = req.nextUrl.pathname; // This will be /api/login, /api/verify, etc.
    const targetUrl = `${backendUrl}${path}`;

    // Forward the request, including the body and cookies
    const response = await fetch(targetUrl, {
        method: req.method,
        headers: {
            'Content-Type': 'application/json',
            'Cookie': req.headers.get('cookie') || '',
        },
        body: req.body,
        redirect: 'manual',
    });

    // Create a new response and copy the headers from the backend
    // This is crucial for passing the 'Set-Cookie' header back to the browser
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