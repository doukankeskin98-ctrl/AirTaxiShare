"use client";

import React, { useState } from 'react';
import { Inbox, Search, Download, Shield, ShieldOff, ShieldCheck, MoreVertical } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://airtaxishare-api.onrender.com';

const thStyle: React.CSSProperties = {
    textAlign: 'left',
    padding: '14px 20px',
    color: '#6B7280',
    fontWeight: 600,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    borderBottom: '1px solid rgba(255,255,255,0.07)',
};

const tdStyle: React.CSSProperties = {
    padding: '14px 20px',
    color: '#D1D5DB',
    fontSize: 14,
};

export function UsersTableClient({ initialUsers, dict }: { initialUsers: any[], dict: any }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState(initialUsers);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    const filteredUsers = users.filter(user => {
        if (!searchQuery) return true;
        const s = searchQuery.toLowerCase();
        const f = user.fullName?.toLowerCase() || '';
        const e = user.email?.toLowerCase() || '';
        return f.includes(s) || e.includes(s);
    });

    const handleAction = async (userId: string, action: 'suspend' | 'ban' | 'activate') => {
        const confirmMsg = action === 'suspend' ? dict.confirmSuspend : action === 'ban' ? dict.confirmBan : dict.confirmActivate;
        if (!confirm(confirmMsg)) return;

        const newStatus = action === 'activate' ? 'ACTIVE' : action === 'suspend' ? 'SUSPENDED' : 'BLOCKED';

        // Optimistic UI update
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
        setActiveMenu(null);

        // Call local API proxy (handles httpOnly cookie auth server-side)
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) {
                // Revert on failure
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: users.find(uu => uu.id === userId)?.status || 'ACTIVE' } : u));
                alert('Operation failed');
            }
        } catch {
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: users.find(uu => uu.id === userId)?.status || 'ACTIVE' } : u));
            alert('Network error');
        }
    };

    const exportToCSV = () => {
        const headers = [dict.user, dict.emailPhone, dict.rating, dict.trips, dict.verified, dict.status, dict.joined].join(',');
        const rows = filteredUsers.map(u => {
            const dateStr = u.createdAt ? new Date(u.createdAt).toISOString() : '';
            return `"${u.fullName || ''}","${u.email || ''}","${u.rating || ''}","${u.tripsCompleted || 0}","${u.emailVerified ? 'Email ' : ''}${u.phoneVerified ? 'Phone' : ''}","${u.status}","${dateStr}"`;
        });
        const csvContent = [headers, ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'users_export.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 700, color: '#F9FAFB', margin: 0, letterSpacing: -0.5 }}>{dict.users}</h1>
                    <p style={{ color: '#6B7280', margin: '6px 0 0', fontSize: 14 }}>
                        {users.length} {dict.registeredUsers}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder={dict.searchUsers}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                padding: '9px 12px 9px 36px', borderRadius: 10,
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#F9FAFB', outline: 'none', fontSize: 13, width: 240,
                                transition: 'border-color 0.2s',
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'rgba(79,70,229,0.5)'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                        />
                        <Search size={15} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: 11 }} />
                    </div>
                    <button onClick={exportToCSV} className="action-btn" style={{ padding: '9px 16px' }}>
                        <Download size={15} />
                        {dict.exportCSV}
                    </button>
                </div>
            </div>

            <div className="glass-card" style={{ borderRadius: 16, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                            <th style={thStyle}>{dict.user}</th>
                            <th style={thStyle}>{dict.emailPhone}</th>
                            <th style={thStyle}>{dict.rating}</th>
                            <th style={thStyle}>{dict.trips}</th>
                            <th style={thStyle}>{dict.verified}</th>
                            <th style={thStyle}>{dict.status}</th>
                            <th style={thStyle}>{dict.joined}</th>
                            <th style={thStyle}>{dict.actions}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={8} style={{ ...tdStyle, textAlign: 'center', padding: '60px 40px', color: '#6B7280' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                                        <div style={{ padding: 16, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 100 }}>
                                            <Inbox size={32} strokeWidth={1.5} color="#4B5563" />
                                        </div>
                                        <div style={{ fontSize: 16, fontWeight: 500, color: '#9CA3AF' }}>{dict.emptyUsers}</div>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredUsers.map((user: any) => (
                            <tr key={user.id} className="table-row">
                                <td style={tdStyle}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{
                                            width: 34, height: 34, borderRadius: 10,
                                            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: '#fff', fontWeight: 700, fontSize: 13,
                                        }}>
                                            {(user.fullName || '?')[0]?.toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, color: '#F9FAFB', fontSize: 14 }}>{user.fullName || '—'}</div>
                                            <div style={{ fontSize: 11, color: '#6B7280' }}>{user.id?.slice(0, 8)}…</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={tdStyle}>
                                    <div style={{ fontSize: 13 }}>{user.email || '—'}</div>
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
                                        background: user.status === 'ACTIVE' ? '#06472030' : user.status === 'SUSPENDED' ? '#78350F30' : '#7F1D1D30',
                                        color: user.status === 'ACTIVE' ? '#34D399' : user.status === 'SUSPENDED' ? '#FBBF24' : '#F87171',
                                    }}>
                                        {user.status}
                                    </span>
                                </td>
                                <td style={tdStyle}>
                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString(
                                        dict.justNow === 'Just now' ? 'en-US' : 'tr-TR',
                                        { day: 'numeric', month: 'short', year: 'numeric' }
                                    ) : '—'}
                                </td>
                                <td style={tdStyle}>
                                    <div style={{ position: 'relative' }}>
                                        <button
                                            onClick={() => setActiveMenu(activeMenu === user.id ? null : user.id)}
                                            className="action-btn"
                                            style={{ padding: '6px 8px' }}
                                        >
                                            <MoreVertical size={14} />
                                        </button>
                                        {activeMenu === user.id && (
                                            <div className="animate-fade-in" style={{
                                                position: 'absolute', right: 0, top: 32, zIndex: 50,
                                                backgroundColor: '#141626', border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: 10, padding: 6, minWidth: 150,
                                                boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
                                            }}>
                                                {user.status !== 'ACTIVE' && (
                                                    <button onClick={() => handleAction(user.id, 'activate')} className="action-btn success" style={{ width: '100%', marginBottom: 4, justifyContent: 'flex-start', border: 'none' }}>
                                                        <ShieldCheck size={13} /> {dict.activate}
                                                    </button>
                                                )}
                                                {user.status !== 'SUSPENDED' && (
                                                    <button onClick={() => handleAction(user.id, 'suspend')} className="action-btn" style={{ width: '100%', marginBottom: 4, justifyContent: 'flex-start', border: 'none' }}>
                                                        <Shield size={13} /> {dict.suspend}
                                                    </button>
                                                )}
                                                {user.status !== 'BLOCKED' && (
                                                    <button onClick={() => handleAction(user.id, 'ban')} className="action-btn danger" style={{ width: '100%', justifyContent: 'flex-start', border: 'none' }}>
                                                        <ShieldOff size={13} /> {dict.ban}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
