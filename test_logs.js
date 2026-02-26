async function test() {
  const url = 'http://localhost:4000';
  const loginRes = await fetch(url + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@airtaxishare.com', password: 'Admin123!' })
  });
  const data = await loginRes.json();
  const token = data.access_token;
  
  const res = await fetch(url + '/admin/logs', {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  const text = await res.text();
  console.log("LOGS RESPONSE:", res.status, text);
}
test();
