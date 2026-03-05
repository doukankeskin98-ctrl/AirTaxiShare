"use client";

import React from 'react';
import { NotificationCenter } from './NotificationCenter';

export function DashboardHeader({ dict, activities }: { dict: any, activities: any[] }) {
    return (
        <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="animate-fade-in">
                <h1 style={{ fontSize: 28, fontWeight: 700, color: '#F9FAFB', margin: 0, letterSpacing: -0.5 }}>
                    {dict.dashboard}
                </h1>
                <p style={{ color: '#6B7280', margin: '6px 0 0', fontSize: 14 }}>
                    {dict.dashboardSubtitle}
                </p>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <NotificationCenter activities={activities} dict={dict} />
            </div>
        </div>
    );
}
