import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://airtaxishare-api.onrender.com';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        const res = await fetch(`${API_URL}/auth/admin-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json(
                { error: data.message || 'Invalid credentials' },
                { status: res.status }
            );
        }

        // Successfully authenticated, extract token
        const token = data.accessToken;

        // Set secured, HTTP-only cookie via the Next.js Response Object
        const response = NextResponse.json({ success: true, user: data.user });

        response.cookies.set({
            name: 'admin_token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24, // 1 day expiration
        });

        return response;

    } catch (error: any) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
