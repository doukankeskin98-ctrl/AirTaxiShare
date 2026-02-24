import React from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://airtaxishare-api.onrender.com';

// For admin logs we use a special query param so backend knows to return all records
async function getAllRideLogs() {
    try {
        // We fetch match stats and history from admin endpoint
        const [statsRes] = await Promise.all([
            fetch(`${API_URL}/match/stats`, { next: { revalidate: 30 } }),
        ]);
        const stats = statsRes.ok ? await statsRes.json() : {};
        return stats;
    } catch {
        return {};
    }
}

const cardStyle: React.CSSProperties = {
    backgroundColor: '#1E2235',
    borderRadius: 16,
    padding: 24,
    border: '1px solid rgba(255,255,255,0.06)',
    boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
    marginBottom: 24,
};

const thStyle: React.CSSProperties = {
    textAlign: 'left',
    padding: '14px 20px',
    color: '#6B7280',
    fontWeight: 600,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    borderBottom: '1px solid rgba(255,255,255,0.07)',
};

const tdStyle: React.CSSProperties = {
    padding: '14px 20px',
    color: '#D1D5DB',
    fontSize: 14,
};

export default async function RideLogsPage() {
    const stats = await getAllRideLogs();

    return (
        <div>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 26, fontWeight: 700, color: '#F9FAFB', margin: 0 }}>Ride Logs</h1>
                <p style={{ color: '#6B7280', margin: '6px 0 0', fontSize: 14 }}>Platform-wide match statistics</p>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
                {[
                    { label: 'Total Matches', value: stats.totalMatches ?? '—', color: '#4F46E5' },
                    { label: 'Completed Rides', value: stats.completedMatches ?? '—', color: '#10B981' },
                    { label: 'Active Now', value: stats.activeMatches ?? '—', color: '#F59E0B' },
                ].map(card => (
                    <div key={card.label} style={{ ...cardStyle, marginBottom: 0, borderTop: `3px solid ${card.color}` }}>
                        <div style={{ fontSize: 12, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{card.label}</div>
                        <div style={{ fontSize: 36, fontWeight: 700, color: '#F9FAFB' }}>{card.value}</div>
                    </div>
                ))}
            </div>

            {/* Match Rate Card */}
            <div style={cardStyle}>
                <h3 style={{ color: '#F9FAFB', marginTop: 0, marginBottom: 16 }}>Match Performance</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                        {
                            label: 'Completion Rate',
                            value: stats.totalMatches > 0
                                ? `${((stats.completedMatches / stats.totalMatches) * 100).toFixed(1)}%`
                                : '—',
                        },
                        {
                            label: 'In-Progress Rate',
                            value: stats.totalMatches > 0
                                ? `${((stats.activeMatches / stats.totalMatches) * 100).toFixed(1)}%`
                                : '—',
                        },
                    ].map(item => (
                        <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <span style={{ color: '#9CA3AF', fontSize: 14 }}>{item.label}</span>
                            <span style={{ color: '#F9FAFB', fontWeight: 700 }}>{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ ...cardStyle, padding: 20 }}>
                <p style={{ color: '#6B7280', fontSize: 14, margin: 0, textAlign: 'center' }}>
                    💡 Individual ride details are visible via the API at{' '}
                    <code style={{ color: '#818CF8', background: 'rgba(129,140,248,0.1)', padding: '2px 6px', borderRadius: 4 }}>
                        GET /match/history
                    </code>{' '}
                    (requires user JWT).
                </p>
            </div>
        </div>
    );
}
