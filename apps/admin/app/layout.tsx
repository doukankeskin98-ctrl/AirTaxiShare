import './globals.css';
import { Sidebar } from './components/Sidebar';

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
            <body style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0B0F19' }}>
                <Sidebar />
                <main style={{ flex: 1, padding: '40px 50px', overflowY: 'auto' }}>
                    {children}
                </main>
            </body>
        </html>
    );
}
