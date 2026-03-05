import './globals.css';
import { Sidebar } from './components/Sidebar';
import { cookies, headers } from 'next/headers';

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
    const token = cookies().get('admin_token')?.value;

    // Don't show sidebar on login page
    const isLoginPage = !token;

    return (
        <html lang={lang}>
            <head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body style={{
                display: 'flex',
                minHeight: '100vh',
                backgroundColor: '#0B0F19',
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif",
                margin: 0,
            }}>
                {!isLoginPage && <Sidebar currentLang={lang} />}
                <main style={{
                    flex: 1,
                    padding: isLoginPage ? 0 : '40px 50px',
                    overflowY: 'auto',
                }}>
                    {children}
                </main>
            </body>
        </html>
    );
}
