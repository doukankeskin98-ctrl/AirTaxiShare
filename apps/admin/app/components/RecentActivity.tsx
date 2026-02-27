import React from 'react';
import { Zap, UserPlus, CheckCircle, MessageSquare, Ticket } from 'lucide-react';

export function RecentActivity({ activities = [], dict }: { activities: any[], dict: any }) {
    if (activities.length === 0) return <div style={{ color: '#6B7280', fontSize: 13, marginTop: 20 }}>{dict.noActivity}</div>;

    const getIconInfo = (type: string) => {
        if (type === 'signup') return { icon: UserPlus, color: '#10B981' };
        if (type === 'match') return { icon: Zap, color: '#0EA5E9' };
        if (type === 'complete') return { icon: CheckCircle, color: '#F59E0B' };
        return { icon: Ticket, color: '#8B5CF6' };
    };

    const timeAgo = (dateStr: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
        if (seconds < 60) return dict.justNow;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}${dict.mins} ${dict.ago}`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}${dict.hours} ${dict.ago}`;
        return `${Math.floor(seconds / 86400)}${dict.days} ${dict.ago}`;
    };
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 16 }}>
            {activities.map((activity, index) => {
                const { icon: Icon, color } = getIconInfo(activity.type);
                return (
                    <div key={activity.id} style={{ display: 'flex', gap: 16, position: 'relative' }}>
                        {index !== activities.length - 1 && (
                            <div style={{ position: 'absolute', left: 19, top: 40, bottom: -20, width: 2, backgroundColor: 'rgba(255,255,255,0.05)' }} />
                        )}
                        <div style={{
                            width: 40, height: 40, borderRadius: 20,
                            backgroundColor: `${color}15`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            zIndex: 1, border: `1px solid ${color}30`
                        }}>
                            <Icon size={18} color={color} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <span style={{ fontSize: 13, color: '#F9FAFB', fontWeight: 500 }}>{activity.text}</span>
                            <span style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{timeAgo(activity.time)}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
