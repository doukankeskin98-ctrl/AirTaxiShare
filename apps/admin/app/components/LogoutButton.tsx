"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export function LogoutButton({ label }: { label?: string }) {
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
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 15px',
                borderRadius: 8,
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#FCA5A5',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                fontSize: 14,
                fontWeight: 500,
            }}
        >
            <LogOut size={16} />
            {label || 'Sign Out'}
        </button>
    );
}
