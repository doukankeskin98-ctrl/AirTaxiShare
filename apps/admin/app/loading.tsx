export default function Loading() {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '60vh',
            flexDirection: 'column',
            gap: 16,
        }}>
            <div style={{
                width: 40,
                height: 40,
                border: '3px solid rgba(255,255,255,0.1)',
                borderTopColor: '#4F46E5',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
