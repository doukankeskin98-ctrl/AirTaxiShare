"use client";

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface GrowthData {
    name: string;
    users: number;
    matches: number;
}

export function UserGrowthChart({ data, dict }: { data: GrowthData[], dict: any }) {
    if (!data || data.length === 0) {
        return <div style={{ color: '#6B7280', fontSize: 13, marginTop: 20 }}>{dict.noData}</div>;
    }

    return (
        <div className="animate-fade-in" style={{ width: '100%', height: 280, marginTop: 16 }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorGrowthMatches" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1E2235',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 10,
                            color: '#fff',
                            fontSize: 13,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                        }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="users" name={dict.totalUsers || 'Users'} stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorUsers)" />
                    <Area type="monotone" dataKey="matches" name={dict.totalMatches || 'Matches'} stroke="#8B5CF6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorGrowthMatches)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
