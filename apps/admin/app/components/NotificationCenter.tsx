"use client";

import React, { useState } from 'react';
import { Bell, X, UserPlus, Zap, AlertTriangle, CheckCircle } from 'lucide-react';

interface Notification {
    id: string;
    type: 'signup' | 'match' | 'alert' | 'success';
    text: string;
    time: string;
    read: boolean;
}

export function NotificationCenter({ activities = [], dict }: { activities: any[], dict: any }) {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>(
        activities.slice(0, 8).map((a: any, i: number) => ({
            id: a.id || String(i),
            type: a.type || 'match',
            text: a.text,
            time: a.time,
            read: i > 2,
        }))
    );

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const getIcon = (type: string) => {
        if (type === 'signup') return <UserPlus size={14} color="#10B981" />;
        if (type === 'match') return <Zap size={14} color="#0EA5E9" />;
        if (type === 'alert') return <AlertTriangle size={14} color="#F59E0B" />;
        return <CheckCircle size={14} color="#8B5CF6" />;
    };

    const timeAgo = (dateStr: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
        if (seconds < 60) return dict.justNow || 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}${dict.mins || 'm'} ${dict.ago || 'ago'}`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}${dict.hours || 'h'} ${dict.ago || 'ago'}`;
        return `${Math.floor(seconds / 86400)}${dict.days || 'd'} ${dict.ago || 'ago'}`;
    };

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'relative',
                    padding: 10,
                    borderRadius: 10,
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer',
                    color: '#9CA3AF',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <Bell size={18} />
                {unreadCount > 0 && (
                    <div style={{
                        position: 'absolute', top: -4, right: -4,
                        width: 18, height: 18, borderRadius: 9,
                        backgroundColor: '#EF4444',
                        color: '#fff', fontSize: 10, fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        animation: 'pulse 2s infinite',
                    }}>
                        {unreadCount}
                    </div>
                )}
            </button>

            {isOpen && (
                <div className="animate-fade-in" style={{
                    position: 'absolute',
                    top: 48,
                    right: 0,
                    width: 360,
                    maxHeight: 440,
                    overflowY: 'auto',
                    backgroundColor: '#141626',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 14,
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                    zIndex: 100,
                }}>
                    <div style={{
                        padding: '16px 20px',
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                        <span style={{ color: '#F9FAFB', fontWeight: 600, fontSize: 15 }}>
                            {dict.notifications || 'Notifications'}
                        </span>
                        <button
                            onClick={markAllRead}
                            style={{
                                background: 'none', border: 'none', color: '#0EA5E9',
                                cursor: 'pointer', fontSize: 12, fontWeight: 600,
                            }}
                        >
                            {dict.markAllRead || 'Mark all read'}
                        </button>
                    </div>
                    {notifications.length === 0 ? (
                        <div style={{ padding: 40, textAlign: 'center', color: '#6B7280', fontSize: 13 }}>
                            {dict.noNotifications || 'No notifications'}
                        </div>
                    ) : notifications.map(n => (
                        <div key={n.id} style={{
                            padding: '14px 20px',
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                            display: 'flex',
                            gap: 12,
                            backgroundColor: !n.read ? 'rgba(14, 165, 233, 0.05)' : 'transparent',
                            transition: 'background-color 0.2s',
                            cursor: 'pointer',
                        }}>
                            <div style={{
                                width: 30, height: 30, borderRadius: 8,
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                {getIcon(n.type)}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 13, color: '#D1D5DB', lineHeight: 1.4 }}>{n.text}</div>
                                <div style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>{timeAgo(n.time)}</div>
                            </div>
                            {!n.read && (
                                <div style={{
                                    width: 7, height: 7, borderRadius: '50%',
                                    backgroundColor: '#0EA5E9', flexShrink: 0, marginTop: 6,
                                }} />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
