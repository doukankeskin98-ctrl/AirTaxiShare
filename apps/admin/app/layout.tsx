import './globals.css';
import { Sidebar } from './components/Sidebar';
import { cookies } from 'next/headers';

export const metadata = {
    title: 'AirTaxiShare Admin',
    description: 'Admin Panel for AirTaxiShare',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const lang = cookies().get('admin_lang')?.value || 'tr';
    return (
        <html lang={lang}>
            <body style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0B0F19' }}>
                <Sidebar currentLang={lang} />
                <main style={{ flex: 1, padding: '40px 50px', overflowY: 'auto' }}>
                    {children}
                </main>
            </body>
        </html>
    );
}
