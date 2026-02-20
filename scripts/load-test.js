const http = require('http');

const USERS_TO_SIMULATE = 100;
const API_URL = 'http://localhost:3000';

async function simulateUser(i) {
    const phoneNumber = `+90555000${i.toString().padStart(4, '0')}`;
    console.log(`User ${i}: Starting login flow with ${phoneNumber}`);

    // 1. Login
    try {
        await request('/auth/login', { phoneNumber });

        // 2. Verify
        const verifyRes = await request('/auth/verify', { phoneNumber, code: '123456' });
        const token = JSON.parse(verifyRes).accessToken;
        console.log(`User ${i}: Authenticated`);

        // 3. Request Match
        await request('/match/request', {
            cluster: 'MASLAK',
            timeWindowStart: new Date().toISOString(),
            timeWindowEnd: new Date(Date.now() + 900000).toISOString(),
            luggageCount: 1,
            groupSize: 1
        }, token);

        console.log(`User ${i}: Match requested`);

    } catch (e) {
        console.error(`User ${i}: Failed`, e.message);
    }
}

function request(path, body, token) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(body);
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length,
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        };

        const req = http.request(options, (res) => {
            let responseBody = '';
            res.on('data', (chunk) => responseBody += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(responseBody);
                } else {
                    reject(new Error(`Status ${res.statusCode}: ${responseBody}`));
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.write(data);
        req.end();
    });
}

// Run
(async () => {
    console.log(`Starting Stress Test for ${USERS_TO_SIMULATE} users...`);
    const promises = [];
    for (let i = 0; i < USERS_TO_SIMULATE; i++) {
        promises.push(simulateUser(i));
        await new Promise(r => setTimeout(r, 50)); // Stagger slightly
    }
    await Promise.all(promises);
    console.log('Stress Test Complete');
})();
