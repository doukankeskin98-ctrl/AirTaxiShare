import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://airtaxishare-api.onrender.com';

/**
 * Proxy admin user actions through Next.js API route
 * so the httpOnly admin_token cookie is automatically included.
 */
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } },
) {
    const token = cookies().get('admin_token')?.value;
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const res = await fetch(`${API_URL}/admin/users/${params.id}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });

        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error: any) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
