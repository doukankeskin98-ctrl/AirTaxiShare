import './globals.css';
import Link from 'next/link';

export const metadata = {
    title: 'AirTaxiShare Admin',
    description: 'Admin Panel for AirTaxiShare',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body style={{ display: 'flex', minHeight: '100vh' }}>
                <aside style={{ width: 250, backgroundColor: '#0A2540', color: 'white', padding: 20 }}>
                    <h2 style={{ marginBottom: 40, borderBottom: '1px solid #333', paddingBottom: 20 }}>AirTaxiShare</h2>
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <Link href="/" style={navItemStyle}>Dashboard</Link>
                        <Link href="/users" style={navItemStyle}>User Management</Link>
                        <Link href="/logs" style={navItemStyle}>Ride Logs</Link>
                        <Link href="/settings" style={navItemStyle}>Settings</Link>
                    </nav>
                </aside>
                <main style={{ flex: 1, padding: 40, overflowY: 'auto' }}>
                    {children}
                </main>
            </body>
        </html>
    );
}

const navItemStyle = {
    padding: '10px 15px',
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: '#ddd',
    display: 'block',
    marginBottom: 5,
};
