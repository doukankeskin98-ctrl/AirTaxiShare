import { NextResponse } from 'next/server';

export async function POST() {
    const response = NextResponse.json({ success: true });

    // Clear the admin_token cookie to forcibly log out
    response.cookies.set({
        name: 'admin_token',
        value: '',
        httpOnly: true,
        expires: new Date(0), // Expire immediately
        path: '/',
    });

    return response;
}
