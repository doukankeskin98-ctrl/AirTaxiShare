import { cookies } from 'next/headers';
import { Users, UserCheck, ListOrdered, CheckCircle, Coins, Activity, Database, Server, Smartphone } from 'lucide-react';
import { AnalyticsChart } from './components/AnalyticsChart';
import { RecentActivity } from './components/RecentActivity';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://airtaxishare-api.onrender.com';

async function getStats() {
    const token = cookies().get('admin_token')?.value;
    try {
        const res = await fetch(`${API_URL}/admin/stats`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store' // Always fetch fresh admin metrics
        });
        if (!res.ok) throw new Error('Unauthorized');
        return await res.json();
    } catch {
        return { totalUsers: 0, activeUsers: 0, totalMatches: 0, completedRides: 0, revenue: 0 };
    }
}

const cardStyle: React.CSSProperties = {
    padding: 24,
    borderRadius: 16,
};

const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
    gap: 20,
    marginBottom: 40,
};

function StatCard({ title, value, color, icon: Icon }: { title: string; value: string | number; color: string; icon: any }) {
    return (
        <div className="glass-card" style={{ ...cardStyle, borderTop: `3px solid ${color}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontSize: 13, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>{title}</div>
                <div style={{ background: `${color}20`, padding: 8, borderRadius: 10, color: color }}>
                    <Icon size={20} />
                </div>
            </div>
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
                <p style={{ color: '#6B7280', margin: '6px 0 0', fontSize: 14 }}>Real-time platform metrics · Live database connection</p>
            </div>

            <div style={gridStyle}>
                <StatCard title="Total Users" value={stats.totalUsers} color="#4F46E5" icon={Users} />
                <StatCard title="Active Users" value={stats.activeUsers} color="#10B981" icon={UserCheck} />
                <StatCard title="Total Matches" value={stats.totalMatches} color="#0EA5E9" icon={ListOrdered} />
                <StatCard title="Completed Rides" value={stats.completedRides} color="#F59E0B" icon={CheckCircle} />
                <StatCard title="Projected Revenue (TL)" value={`₺${stats.revenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`} color="#EC4899" icon={Coins} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
                <div className="glass-card" style={cardStyle}>
                    <h3 style={{ color: '#F9FAFB', marginTop: 0, fontSize: 18 }}>Revenue & Growth Analytics</h3>
                    <p style={{ color: '#6B7280', fontSize: 13, marginTop: 4 }}>Platform volume projected over the last 7 days.</p>
                    <AnalyticsChart data={stats.chartData || []} />
                </div>

                <div className="glass-card" style={cardStyle}>
                    <h3 style={{ color: '#F9FAFB', marginTop: 0, fontSize: 18 }}>Live Activity Feed</h3>
                    <p style={{ color: '#6B7280', fontSize: 13, marginTop: 4 }}>Real-time matchmaking audit log.</p>
                    <RecentActivity activities={stats.recentActivity || []} />
                </div>
            </div>
        </div>
    );
}
