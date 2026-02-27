"use client";

import React, { useState } from 'react';
import { Inbox, Search, Download } from 'lucide-react';

const cardStyle: React.CSSProperties = {
    padding: '0',
    borderRadius: 16,
    overflow: 'hidden',
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

export function UsersTableClient({ initialUsers, dict }: { initialUsers: any[], dict: any }) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredUsers = initialUsers.filter(user => {
        if (!searchQuery) return true;
        const s = searchQuery.toLowerCase();
        const f = user.fullName?.toLowerCase() || '';
        const e = user.email?.toLowerCase() || '';
        return f.includes(s) || e.includes(s);
    });

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
        <div>
            <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 700, color: '#F9FAFB', margin: 0 }}>{dict.users}</h1>
                    <p style={{ color: '#6B7280', margin: '6px 0 0', fontSize: 14 }}>{initialUsers.length} {dict.registeredUsers}</p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder={dict.searchUsers}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ padding: '8px 12px 8px 36px', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F9FAFB', outline: 'none', fontSize: 13, width: 220 }}
                        />
                        <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: 10 }} />
                    </div>
                    <button onClick={exportToCSV} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F9FAFB', cursor: 'pointer', fontWeight: 500, fontSize: 13, transition: 'background-color 0.2s' }} className="sidebar-link">
                        <Download size={16} />
                        {dict.exportCSV}
                    </button>
                </div>
            </div>

            <div className="glass-card" style={cardStyle}>
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
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ ...tdStyle, textAlign: 'center', padding: '60px 40px', color: '#6B7280' }}>
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
                                <td style={tdStyle}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString(dict.justNow === 'Just now' ? 'en-US' : 'tr-TR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
