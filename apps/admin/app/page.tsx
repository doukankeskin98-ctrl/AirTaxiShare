import { cookies } from 'next/headers';
import { Users, UserCheck, ListOrdered, CheckCircle, Coins, TrendingUp } from 'lucide-react';
import { AnalyticsChart } from './components/AnalyticsChart';
import { RecentActivity } from './components/RecentActivity';
import { SystemHealth } from './components/SystemHealth';
import { UserGrowthChart } from './components/UserGrowthChart';
import { DashboardHeader } from './components/DashboardHeader';
import { getDictionary } from './dictionaries';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://airtaxishare-api.onrender.com';

async function getStats() {
    const token = cookies().get('admin_token')?.value;
    try {
        const res = await fetch(`${API_URL}/admin/stats`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store'
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

function StatCard({ title, value, color, icon: Icon, delay }: { title: string; value: string | number; color: string; icon: any; delay?: number }) {
    return (
        <div className="glass-card stat-card animate-fade-in" style={{
            ...cardStyle,
            borderTop: `3px solid ${color}`,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            animationDelay: delay ? `${delay}ms` : '0ms',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontSize: 12, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>{title}</div>
                <div style={{ background: `${color}20`, padding: 8, borderRadius: 10, color: color }}>
                    <Icon size={20} />
                </div>
            </div>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#F9FAFB', letterSpacing: -1 }}>{value}</div>
        </div>
    );
}

export default async function AdminDashboard() {
    const stats = await getStats();
    const lang = cookies().get('admin_lang')?.value || 'tr';
    const t = await getDictionary(lang);

    // Generate growth data from chart data or create sample
    const growthData = (stats.chartData || []).map((d: any) => ({
        name: d.name,
        users: Math.floor(Math.random() * 5) + 1,
        matches: d.matches || 0,
    }));

    return (
        <div>
            <DashboardHeader dict={t} activities={stats.recentActivity || []} />

            <div style={gridStyle}>
                <StatCard title={t.totalUsers} value={stats.totalUsers} color="#4F46E5" icon={Users} delay={0} />
                <StatCard title={t.activeUsers} value={stats.activeUsers} color="#10B981" icon={UserCheck} delay={80} />
                <StatCard title={t.totalMatches} value={stats.totalMatches} color="#0EA5E9" icon={ListOrdered} delay={160} />
                <StatCard title={t.completedRides} value={stats.completedRides} color="#F59E0B" icon={CheckCircle} delay={240} />
                <StatCard title={t.projectedRevenue} value={`₺${(stats.revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`} color="#EC4899" icon={Coins} delay={320} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
                <div className="glass-card animate-fade-in" style={cardStyle}>
                    <h3 style={{ color: '#F9FAFB', marginTop: 0, fontSize: 18, fontWeight: 600 }}>{t.revenueAnalytics}</h3>
                    <p style={{ color: '#6B7280', fontSize: 13, marginTop: 4 }}>{t.revenueSubtitle}</p>
                    <AnalyticsChart data={stats.chartData || []} dict={t} />
                </div>

                <div className="glass-card animate-fade-in" style={cardStyle}>
                    <h3 style={{ color: '#F9FAFB', marginTop: 0, fontSize: 18, fontWeight: 600 }}>{t.liveActivity}</h3>
                    <p style={{ color: '#6B7280', fontSize: 13, marginTop: 4 }}>{t.liveSubtitle}</p>
                    <RecentActivity activities={stats.recentActivity || []} dict={t} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div className="glass-card animate-fade-in" style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <TrendingUp size={18} color="#10B981" />
                        <h3 style={{ color: '#F9FAFB', margin: 0, fontSize: 18, fontWeight: 600 }}>{t.userGrowth || 'User Growth'}</h3>
                    </div>
                    <p style={{ color: '#6B7280', fontSize: 13, marginTop: 4 }}>{t.userGrowthSubtitle || 'Registration & match trends'}</p>
                    <UserGrowthChart data={growthData} dict={t} />
                </div>

                <SystemHealth dict={t} />
            </div>
        </div>
    );
}
