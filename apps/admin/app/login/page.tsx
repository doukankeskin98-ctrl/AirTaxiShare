"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Login failed');
            }

            // Successfully set cookie via the Next.js API route
            router.push('/');
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <h1 style={styles.title}>AirTaxi HQ</h1>
                    <p style={styles.subtitle}>Secure Admin Portal</p>
                </div>

                <form onSubmit={handleLogin} style={styles.form}>
                    {error && <div style={styles.errorBox}>{error}</div>}

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Admin Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={styles.input}
                            placeholder="hq@airtaxishare.com"
                            required
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? 'Authenticating...' : 'Sign In to HQ'}
                    </button>
                </form>
            </div>

            {/* Background design elements */}
            <div style={styles.bgGlow1} />
            <div style={styles.bgGlow2} />
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#050511',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    card: {
        backgroundColor: 'rgba(20, 22, 38, 0.7)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 24,
        padding: '40px',
        width: '100%',
        maxWidth: 420,
        zIndex: 10,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    },
    header: {
        textAlign: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: 800,
        color: '#FFF',
        margin: '0 0 8px 0',
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 15,
        color: '#9CA3AF',
        margin: 0,
        fontWeight: 500,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
    },
    label: {
        fontSize: 13,
        color: '#D1D5DB',
        fontWeight: 600,
        letterSpacing: 0.5,
    },
    input: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: '14px 16px',
        color: '#FFF',
        fontSize: 15,
        outline: 'none',
        transition: 'all 0.2s ease',
    },
    button: {
        backgroundColor: '#4F46E5',
        color: '#FFF',
        border: 'none',
        borderRadius: 12,
        padding: '14px',
        fontSize: 16,
        fontWeight: 600,
        cursor: 'pointer',
        marginTop: 8,
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 14px 0 rgba(79, 70, 229, 0.39)',
    },
    errorBox: {
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        color: '#FCA5A5',
        padding: '12px 16px',
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 500,
        textAlign: 'center',
    },
    bgGlow1: {
        position: 'absolute',
        top: '20%',
        left: '20%',
        width: 400,
        height: 400,
        backgroundColor: 'rgba(79, 70, 229, 0.15)',
        borderRadius: '50%',
        filter: 'blur(100px)',
        zIndex: 1,
    },
    bgGlow2: {
        position: 'absolute',
        bottom: '10%',
        right: '20%',
        width: 500,
        height: 500,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderRadius: '50%',
        filter: 'blur(120px)',
        zIndex: 1,
    },
};
