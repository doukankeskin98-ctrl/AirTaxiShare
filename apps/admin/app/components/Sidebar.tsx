"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Clock, LogOut, Globe } from 'lucide-react';
import { LogoutButton } from './LogoutButton';
import { getDictionary } from '../dictionaries';

export function Sidebar({ currentLang }: { currentLang: string }) {
    const pathname = usePathname();
    const t = getDictionary(currentLang);

    const links = [
        { href: '/', label: t.dashboard, icon: LayoutDashboard },
        { href: '/users', label: t.users, icon: Users },
        { href: '/logs', label: t.logs, icon: Clock },
    ];

    const toggleLang = () => {
        const nextLang = currentLang === 'en' ? 'tr' : 'en';
        document.cookie = `admin_lang=${nextLang}; path=/; max-age=31536000`;
        window.location.reload();
    };

    return (
        <aside style={{
            width: 260,
            backgroundColor: '#0A1320', // Even darker, richer navy
            color: 'white',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid rgba(255,255,255,0.05)'
        }}>
            <div style={{ marginBottom: 40, paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #00A3FF, #0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    A
                </div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: -0.5 }}>AirTaxi Admin</h2>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    const Icon = link.icon;
                    return (
                        <Link key={link.href} href={link.href} className="sidebar-link" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '12px 16px',
                            borderRadius: 10,
                            backgroundColor: isActive ? 'rgba(14, 165, 233, 0.15)' : 'transparent',
                            color: isActive ? '#38BDF8' : '#9CA3AF',
                            fontWeight: isActive ? 600 : 500,
                            transition: 'all 0.2s ease',
                            borderLeft: isActive ? '3px solid #38BDF8' : '3px solid transparent'
                        }}>
                            <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                            {link.label}
                        </Link>
                    )
                })}
            </nav>

            <div style={{ flex: 1 }} />

            <div style={{ paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button
                    onClick={toggleLang}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderRadius: 8,
                        backgroundColor: 'rgba(255,255,255,0.05)', color: '#F9FAFB', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
                        transition: 'background-color 0.2s', fontWeight: 500
                    }}
                    className="sidebar-link"
                >
                    <Globe size={18} />
                    {currentLang === 'en' ? 'Türkçe\'ye Geç' : 'Switch to English'}
                </button>
                <LogoutButton />
            </div>
        </aside>
    );
}
