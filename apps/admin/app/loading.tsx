import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
            <Loader2 className="animate-spin" size={32} color="#38BDF8" style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ color: '#6B7280', fontSize: 14, fontWeight: 500 }}>Fetching live database metrics...</p>
            <style>
                {`
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `}
            </style>
        </div>
    );
}
