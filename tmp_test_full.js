async function testFull() {
  try {
    // 1. Login to get cookie
    const loginRes = await fetch('http://localhost:3001/api/auth/member-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Usha', password: 'password123' }) // Assumes Usha/password123 exists
    });
    
    if (!loginRes.ok) return console.log('Login failed', await loginRes.text());
    
    const setCookie = loginRes.headers.get('set-cookie');
    const cookieString = setCookie ? setCookie.split(';')[0] : '';
    
    // 2. Apply for loan using manual multipart boundary
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    let data = '';

    data += `--${boundary}\r\n`;
    data += `Content-Disposition: form-data; name="amount"\r\n\r\n`;
    data += `1500\r\n`;

    data += `--${boundary}\r\n`;
    data += `Content-Disposition: form-data; name="purpose"\r\n\r\n`;
    data += `Other\r\n`;

    data += `--${boundary}\r\n`;
    data += `Content-Disposition: form-data; name="duration"\r\n\r\n`;
    data += `3\r\n`;
    
    data += `--${boundary}\r\n`;
    data += `Content-Disposition: form-data; name="aadhar_number"\r\n\r\n`;
    data += `3453243\r\n`;

    // Mock file empty content
    data += `--${boundary}\r\n`;
    data += `Content-Disposition: form-data; name="aadhar_image"; filename="a.txt"\r\n`;
    data += `Content-Type: text/plain\r\n\r\n`;
    data += `dummy data\r\n`;

    data += `--${boundary}\r\n`;
    data += `Content-Disposition: form-data; name="passbook_image"; filename="b.txt"\r\n`;
    data += `Content-Type: text/plain\r\n\r\n`;
    data += `dummy data\r\n`;

    data += `--${boundary}--\r\n`;

    const applyRes = await fetch('http://localhost:3001/api/loan/apply', {
      method: 'POST',
      headers: {
        'Cookie': cookieString,
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: data
    });

    const result = await applyRes.text();
    console.log("Apply result:", result);

  } catch (e) {
    console.error("Test execution error:", e);
  }
}

testFull();
