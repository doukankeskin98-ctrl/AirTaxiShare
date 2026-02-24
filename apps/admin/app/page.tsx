import React from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://airtaxishare-api.onrender.com';

async function getStats() {
    try {
        const [userRes, matchRes] = await Promise.all([
            fetch(`${API_URL}/user/stats`, { next: { revalidate: 60 } }),
            fetch(`${API_URL}/match/stats`, { next: { revalidate: 60 } }),
        ]);
        const userStats = userRes.ok ? await userRes.json() : { totalUsers: 0, activeUsers: 0 };
        const matchStats = matchRes.ok ? await matchRes.json() : { totalMatches: 0, completedMatches: 0, activeMatches: 0 };
        return { ...userStats, ...matchStats };
    } catch {
        return { totalUsers: 0, activeUsers: 0, totalMatches: 0, completedMatches: 0, activeMatches: 0 };
    }
}

const cardStyle: React.CSSProperties = {
    backgroundColor: '#1E2235',
    borderRadius: 16,
    padding: 24,
    boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
    border: '1px solid rgba(255,255,255,0.06)',
};

const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
    gap: 20,
    marginBottom: 40,
};

function StatCard({ title, value, color }: { title: string; value: string | number; color: string }) {
    return (
        <div style={{ ...cardStyle, borderTop: `3px solid ${color}` }}>
            <div style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>{title}</div>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#F9FAFB' }}>{value}</div>
        </div>
    );
}

export default async function AdminDashboard() {
    const stats = await getStats();

    return (
        <div>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 26, fontWeight: 700, color: '#F9FAFB', margin: 0 }}>Dashboard</h1>
                <p style={{ color: '#6B7280', margin: '6px 0 0', fontSize: 14 }}>Live platform metrics · refreshes every 60s</p>
            </div>

            <div style={gridStyle}>
                <StatCard title="Total Users" value={stats.totalUsers} color="#4F46E5" />
                <StatCard title="Active Users" value={stats.activeUsers} color="#10B981" />
                <StatCard title="Total Matches" value={stats.totalMatches} color="#0EA5E9" />
                <StatCard title="Completed Rides" value={stats.completedMatches} color="#F59E0B" />
                <StatCard title="Active Matches" value={stats.activeMatches} color="#EC4899" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
                <div style={cardStyle}>
                    <h3 style={{ color: '#F9FAFB', marginTop: 0 }}>Platform Status</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[
                            { label: 'API Health', value: 'Operational', color: '#10B981' },
                            { label: 'Database', value: 'Connected', color: '#10B981' },
                            { label: 'WebSocket', value: 'Active', color: '#10B981' },
                            { label: 'Push Notifications', value: 'Firebase Required', color: '#F59E0B' },
                        ].map(item => (
                            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ color: '#9CA3AF', fontSize: 14 }}>{item.label}</span>
                                <span style={{ color: item.color, fontWeight: 600, fontSize: 14 }}>{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={cardStyle}>
                    <h3 style={{ color: '#F9FAFB', marginTop: 0 }}>Quick Links</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {[
                            { label: '→ Manage Users', href: '/users' },
                            { label: '→ View Ride Logs', href: '/logs' },
                            { label: '→ Settings', href: '/settings' },
                            { label: '→ API Health', href: 'https://airtaxishare-api.onrender.com/health' },
                        ].map(link => (
                            <a key={link.label} href={link.href} style={{ color: '#818CF8', textDecoration: 'none', fontSize: 14 }}>{link.label}</a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
