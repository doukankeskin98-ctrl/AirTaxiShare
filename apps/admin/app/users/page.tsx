import { cookies } from 'next/headers';
import { Inbox, Search, Download } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://airtaxishare-api.onrender.com';

async function getUsers() {
    const token = cookies().get('admin_token')?.value;
    try {
        const res = await fetch(`${API_URL}/admin/users`, {
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
import { UsersTableClient } from './UsersTableClient';

export default async function UsersPage() {
    const users = await getUsers();
    const lang = cookies().get('admin_lang')?.value || 'tr';
    const t = getDictionary(lang);

    return <UsersTableClient initialUsers={users} dict={t} />;
}
