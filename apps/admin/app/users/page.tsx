import React from 'react';

export default function UsersPage() {
    const users = [
        { id: '1', name: 'John Doe', email: 'john@example.com', status: 'Active', joined: '2023-10-01' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'Active', joined: '2023-10-02' },
        { id: '3', name: 'Mehmet Y.', email: 'mehmet@example.com', status: 'Suspended', joined: '2023-10-05' },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
                <h1 style={{ fontSize: 28 }}>User Management</h1>
                <button style={btnStyle}>Export CSV</button>
            </div>

            <div style={cardStyle}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                            <th style={thStyle}>ID</th>
                            <th style={thStyle}>Name</th>
                            <th style={thStyle}>Email</th>
                            <th style={thStyle}>Status</th>
                            <th style={thStyle}>Joined</th>
                            <th style={thStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={tdStyle}>{user.id}</td>
                                <td style={tdStyle}>{user.name}</td>
                                <td style={tdStyle}>{user.email}</td>
                                <td style={tdStyle}>
                                    <span style={{
                                        ...badgeStyle,
                                        backgroundColor: user.status === 'Active' ? '#E8F5E9' : '#FFEBEE',
                                        color: user.status === 'Active' ? '#2E7D32' : '#C62828'
                                    }}>
                                        {user.status}
                                    </span>
                                </td>
                                <td style={tdStyle}>{user.joined}</td>
                                <td style={tdStyle}>
                                    <button style={actionBtnStyle}>Edit</button>
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

const btnStyle = {
    backgroundColor: '#0A2540',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: 6,
    cursor: 'pointer',
};

const actionBtnStyle = {
    background: 'none',
    border: 'none',
    color: '#00A3FF',
    cursor: 'pointer',
    fontWeight: 500,
};
