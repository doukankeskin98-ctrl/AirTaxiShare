"use client";

import React, { useEffect, useState } from 'react';
import { Activity, Database, Server, Wifi, Clock, Cpu } from 'lucide-react';

interface HealthMetric {
    label: string;
    value: string;
    status: 'healthy' | 'warning' | 'error';
    icon: any;
}

export function SystemHealth({ dict }: { dict: any }) {
    const [uptime, setUptime] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => setUptime(prev => prev + 1), 1000);
        return () => clearInterval(interval);
    }, []);

    const formatUptime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h}h ${m}m ${s}s`;
    };

    const metrics: HealthMetric[] = [
        { label: 'API Server', value: 'Operational', status: 'healthy', icon: Server },
        { label: 'Database', value: 'Connected', status: 'healthy', icon: Database },
        { label: 'WebSocket', value: 'Active', status: 'healthy', icon: Wifi },
        { label: 'Uptime', value: formatUptime(uptime), status: 'healthy', icon: Clock },
        { label: 'CPU Usage', value: '12%', status: 'healthy', icon: Cpu },
        { label: 'Response Time', value: '45ms', status: 'healthy', icon: Activity },
    ];

    const statusColor = (s: string) =>
        s === 'healthy' ? '#10B981' : s === 'warning' ? '#F59E0B' : '#EF4444';

    return (
        <div className="glass-card animate-fade-in" style={{ padding: 24, borderRadius: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10B981', animation: 'pulse 2s infinite' }} />
                <h3 style={{ color: '#F9FAFB', margin: 0, fontSize: 18, fontWeight: 600 }}>
                    {dict.systemHealth || 'System Health'}
                </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {metrics.map((m, i) => {
                    const Icon = m.icon;
                    return (
                        <div key={i} className="animate-fade-in" style={{
                            padding: '14px 16px',
                            borderRadius: 12,
                            backgroundColor: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            animationDelay: `${i * 80}ms`,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <Icon size={14} color={statusColor(m.status)} />
                                <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                    {m.label}
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{
                                    width: 6, height: 6, borderRadius: '50%',
                                    backgroundColor: statusColor(m.status),
                                    boxShadow: `0 0 6px ${statusColor(m.status)}40`,
                                }} />
                                <span style={{ fontSize: 14, color: '#F9FAFB', fontWeight: 600 }}>{m.value}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
