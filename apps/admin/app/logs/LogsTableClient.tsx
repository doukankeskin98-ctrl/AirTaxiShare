"use client";

import React, { useState } from 'react';
import { Inbox, Download } from 'lucide-react';

const cardStyle: React.CSSProperties = {
    padding: 24,
    borderRadius: 16,
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

export function LogsTableClient({ initialLogs, dict }: { initialLogs: any[], dict: any }) {
    const [dateFilter, setDateFilter] = useState('');

    const filteredLogs = initialLogs.filter(log => {
        if (!dateFilter) return true;
        if (!log.matchedAt) return false;
        // The input type="date" yields YYYY-MM-DD
        const logDate = new Date(log.matchedAt).toISOString().split('T')[0];
        return logDate === dateFilter;
    });

    const exportToCSV = () => {
        const headers = [dict.matchId, dict.rideTarget, dict.user1, dict.user2, dict.status, dict.matchedAt, dict.completedAt].join(',');
        const rows = filteredLogs.map(log => {
            const m = log.matchedAt ? new Date(log.matchedAt).toISOString() : '';
            const c = log.completedAt ? new Date(log.completedAt).toISOString() : '';
            return `"${log.id}","${log.destination || ''}","${log.user1?.fullName || ''}","${log.user2?.fullName || ''}","${log.status || ''}","${m}","${c}"`;
        });
        const csvContent = [headers, ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'logs_export.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div>
            <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 700, color: '#F9FAFB', margin: 0 }}>{dict.logs}</h1>
                    <p style={{ color: '#6B7280', margin: '6px 0 0', fontSize: 14 }}>{dict.matchStats}</p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            style={{ padding: '7px 12px', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F9FAFB', outline: 'none', fontSize: 13, colorScheme: 'dark' }}
                        />
                    </div>
                    <button onClick={exportToCSV} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F9FAFB', cursor: 'pointer', fontWeight: 500, fontSize: 13, transition: 'background-color 0.2s' }} className="sidebar-link">
                        <Download size={16} />
                        {dict.exportData}
                    </button>
                </div>
            </div>

            <div className="glass-card" style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                            <th style={thStyle}>{dict.matchId}</th>
                            <th style={thStyle}>{dict.rideTarget}</th>
                            <th style={thStyle}>{dict.user1}</th>
                            <th style={thStyle}>{dict.user2}</th>
                            <th style={thStyle}>{dict.status}</th>
                            <th style={thStyle}>{dict.matchedAt}</th>
                            <th style={thStyle}>{dict.completedAt}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ ...tdStyle, textAlign: 'center', padding: '60px 40px', color: '#6B7280' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                                        <div style={{ padding: 16, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 100 }}>
                                            <Inbox size={32} strokeWidth={1.5} color="#4B5563" />
                                        </div>
                                        <div style={{ fontSize: 16, fontWeight: 500, color: '#9CA3AF' }}>{dict.emptyLogs}</div>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredLogs.map((log: any) => (
                            <tr key={log.id} className="table-row">
                                <td style={{ ...tdStyle, color: '#6B7280', fontSize: 11 }}>{log.id.slice(0, 8)}…</td>
                                <td style={{ ...tdStyle, fontWeight: 600, color: '#F9FAFB' }}>{log.destination || 'AirTaxis'}</td>
                                <td style={tdStyle}>
                                    <div style={{ color: '#D1D5DB' }}>{log.user1?.fullName || '—'}</div>
                                    <div style={{ fontSize: 11, color: '#6B7280' }}>{log.user1?.email || '—'}</div>
                                </td>
                                <td style={tdStyle}>
                                    <div style={{ color: '#D1D5DB' }}>{log.user2?.fullName || '—'}</div>
                                    <div style={{ fontSize: 11, color: '#6B7280' }}>{log.user2?.email || '—'}</div>
                                </td>
                                <td style={tdStyle}>
                                    <span style={{
                                        padding: '3px 10px',
                                        borderRadius: 100,
                                        fontSize: 12,
                                        fontWeight: 600,
                                        background: log.status === 'COMPLETED' ? '#06472030' : (log.status === 'ACTIVE' ? '#4F46E530' : '#7F1D1D30'),
                                        color: log.status === 'COMPLETED' ? '#34D399' : (log.status === 'ACTIVE' ? '#818CF8' : '#F87171'),
                                    }}>
                                        {log.status || 'UNKNOWN'}
                                    </span>
                                </td>
                                <td style={tdStyle}>{log.matchedAt ? new Date(log.matchedAt).toLocaleString(dict.justNow === 'Just now' ? 'en-US' : 'tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                                <td style={tdStyle}>{log.completedAt ? new Date(log.completedAt).toLocaleString(dict.justNow === 'Just now' ? 'en-US' : 'tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
