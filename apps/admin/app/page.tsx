import React from 'react';

export default function AdminDashboard() {
    return (
        <div>
            <h1 style={{ fontSize: 28, marginBottom: 30 }}>Dashboard</h1>

            <div style={gridStyle}>
                <Card title="Active Searches" value="42" color="#00A3FF" />
                <Card title="Match Rate" value="78%" color="#00C853" />
                <Card title="Avg. Waiting Time" value="4m 12s" color="#FFAB00" />
                <Card title="Online Drivers" value="15" color="#651FFF" />
            </div>

            <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 30 }}>
                <div style={panelStyle}>
                    <h3>Live Heatmap</h3>
                    <div style={{ background: '#eee', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>
                        {/* Placeholder for Map */}
                        <div style={{ textAlign: 'center', color: '#666' }}>
                            <p>Map View</p>
                            <small>Maslak: High Demand</small><br />
                            <small>Levent: Moderate</small>
                        </div>
                    </div>
                </div>

                <div style={panelStyle}>
                    <h3>Recent Activity</h3>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li style={listItemStyle}>Match found for User #8291</li>
                        <li style={listItemStyle}>New User Registration: Ali K.</li>
                        <li style={listItemStyle}>Match Request: Destination Ataşehir</li>
                        <li style={listItemStyle}>Feedback received: 5 Stars</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

const Card = ({ title, value, color }: { title: string, value: string, color: string }) => (
    <div style={{ ...cardStyle, borderLeft: `5px solid ${color}` }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#666', fontSize: 14 }}>{title}</h4>
        <span style={{ fontSize: 24, fontWeight: 'bold' }}>{value}</span>
    </div>
);

const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 20
};

const cardStyle = {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
};

const panelStyle = {
    ...cardStyle,
    padding: 25,
};

const listItemStyle = {
    padding: '12px 0',
    borderBottom: '1px solid #eee',
    fontSize: 14,
    color: '#444',
};
