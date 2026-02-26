"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

export function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
            router.refresh();
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
        <button
            onClick={handleLogout}
            style={{
                width: '100%',
                padding: '10px 15px',
                borderRadius: 8,
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#FCA5A5',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                cursor: 'pointer',
                textAlign: 'left',
                marginTop: 'auto',
                transition: 'all 0.2s',
            }}
        >
            🚪 Sign Out
        </button>
    );
}
