import fs from 'fs';
import path from 'path';

async function testApply() {
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

  // Provide a dummy member_id to test if the database query fails.
  data += `--${boundary}\r\n`;
  data += `Content-Disposition: form-data; name="member_id"\r\n\r\n`;
  data += `1\r\n`; // using 1 as member we assume exists for testing

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

  try {
    const res = await fetch('http://localhost:3001/api/loan/apply', {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: data
    });
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch(e) {
    console.error(e);
  }
}

testApply();
