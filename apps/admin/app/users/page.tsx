import React from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://airtaxishare-api.onrender.com';

async function getUsers() {
    try {
        const res = await fetch(`${API_URL}/user/all`, { next: { revalidate: 30 } });
        if (!res.ok) return [];
        return await res.json();
    } catch {
        return [];
    }
}

const cardStyle: React.CSSProperties = {
    backgroundColor: '#1E2235',
    borderRadius: 16,
    padding: '0',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.06)',
    boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
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

export default async function UsersPage() {
    const users = await getUsers();

    return (
        <div>
            <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 700, color: '#F9FAFB', margin: 0 }}>User Management</h1>
                    <p style={{ color: '#6B7280', margin: '6px 0 0', fontSize: 14 }}>{users.length} registered users</p>
                </div>
            </div>

            <div style={cardStyle}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                            <th style={thStyle}>User</th>
                            <th style={thStyle}>Email / Phone</th>
                            <th style={thStyle}>Rating</th>
                            <th style={thStyle}>Trips</th>
                            <th style={thStyle}>Verified</th>
                            <th style={thStyle}>Status</th>
                            <th style={thStyle}>Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ ...tdStyle, textAlign: 'center', padding: 40, color: '#6B7280' }}>
                                    No users found
                                </td>
                            </tr>
                        ) : users.map((user: any) => (
                            <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                <td style={tdStyle}>
                                    <div style={{ fontWeight: 600, color: '#F9FAFB' }}>{user.fullName || '—'}</div>
                                    <div style={{ fontSize: 11, color: '#6B7280' }}>{user.id?.slice(0, 8)}…</div>
                                </td>
                                <td style={tdStyle}>
                                    <div>{user.email || '—'}</div>
                                    <div style={{ color: '#6B7280' }}>{user.phoneNumber || '—'}</div>
                                </td>
                                <td style={tdStyle}>
                                    <span style={{ color: '#F59E0B', fontWeight: 700 }}>★ {user.rating?.toFixed(1) || '—'}</span>
                                </td>
                                <td style={tdStyle}>{user.tripsCompleted ?? 0}</td>
                                <td style={tdStyle}>
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        {user.emailVerified && <span style={{ background: '#1D4ED820', color: '#60A5FA', padding: '2px 8px', borderRadius: 100, fontSize: 11, fontWeight: 600 }}>Email</span>}
                                        {user.phoneVerified && <span style={{ background: '#06472020', color: '#34D399', padding: '2px 8px', borderRadius: 100, fontSize: 11, fontWeight: 600 }}>Phone</span>}
                                    </div>
                                </td>
                                <td style={tdStyle}>
                                    <span style={{
                                        padding: '3px 10px',
                                        borderRadius: 100,
                                        fontSize: 12,
                                        fontWeight: 600,
                                        background: user.status === 'ACTIVE' ? '#06472030' : '#7F1D1D30',
                                        color: user.status === 'ACTIVE' ? '#34D399' : '#F87171',
                                    }}>
                                        {user.status}
                                    </span>
                                </td>
                                <td style={tdStyle}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR') : '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
