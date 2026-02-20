import React from 'react';

export default function RideLogsPage() {
    const rides = [
        { id: 'R-101', from: 'Maslak', to: 'Airport', users: 3, date: '2023-10-25 09:30', status: 'Completed' },
        { id: 'R-102', from: 'Levent', to: 'Airport', users: 2, date: '2023-10-25 10:15', status: 'Completed' },
        { id: 'R-103', from: 'Ataşehir', to: 'Airport', users: 1, date: '2023-10-25 11:00', status: 'Cancelled' },
    ];

    return (
        <div>
            <h1 style={{ fontSize: 28, marginBottom: 30 }}>Ride Logs</h1>

            <div style={cardStyle}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                            <th style={thStyle}>Ride ID</th>
                            <th style={thStyle}>From</th>
                            <th style={thStyle}>To</th>
                            <th style={thStyle}>Users</th>
                            <th style={thStyle}>Date & Time</th>
                            <th style={thStyle}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rides.map(ride => (
                            <tr key={ride.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={tdStyle}>{ride.id}</td>
                                <td style={tdStyle}>{ride.from}</td>
                                <td style={tdStyle}>{ride.to}</td>
                                <td style={tdStyle}>{ride.users} / 4</td>
                                <td style={tdStyle}>{ride.date}</td>
                                <td style={tdStyle}>
                                    <span style={{
                                        ...badgeStyle,
                                        backgroundColor: ride.status === 'Completed' ? '#E8F5E9' : '#FFEBEE',
                                        color: ride.status === 'Completed' ? '#2E7D32' : '#C62828'
                                    }}>
                                        {ride.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const cardStyle = {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
};

const thStyle = {
    padding: '15px 10px',
    color: '#666',
    fontWeight: 600,
};

const tdStyle = {
    padding: '15px 10px',
    color: '#333',
};

const badgeStyle = {
    padding: '4px 8px',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 500,
};
