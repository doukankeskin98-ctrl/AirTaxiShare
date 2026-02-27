import { cookies } from 'next/headers';
import { Inbox, Search, Download } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://airtaxishare-api.onrender.com';

async function getRideLogs() {
    const token = cookies().get('admin_token')?.value;
    try {
        const res = await fetch(`${API_URL}/admin/logs`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store'
        });
        if (!res.ok) return [];
        return await res.json();
    } catch {
        return [];
    }
}

import { getDictionary } from '../dictionaries';
import { LogsTableClient } from './LogsTableClient';

export default async function RideLogsPage() {
    const logs = await getRideLogs();
    const lang = cookies().get('admin_lang')?.value || 'tr';
    const t = getDictionary(lang);

    return <LogsTableClient initialLogs={logs} dict={t} />;
}
