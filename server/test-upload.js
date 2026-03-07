const fs = require('fs');
const path = require('path');

// First, get a token by logging in
const loginAndUpload = async () => {
  const http = require('http');
  
  // Login first to get token
  const loginData = JSON.stringify({
    username: 'admin',
    password: 'admin123'
  });

  const loginOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': loginData.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(loginOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', async () => {
        try {
          const result = JSON.parse(data);
          if (result.token) {
            console.log('Login successful!');
            // Now upload the file
            await uploadFile(result.token);
          } else {
            console.log('Login failed:', result);
          }
        } catch (e) {
          console.log('Error:', e.message);
        }
      });
    });
    req.on('error', (e) => console.log('Login error:', e.message));
    req.write(loginData);
    req.end();
  });

  async function uploadFile(token) {
    const filePath = path.join(__dirname, 'test-schools.xlsx');
    const fileBuffer = fs.readFileSync(filePath);
    
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const formData = Buffer.concat([
      Buffer.from(`--${boundary}\r\n`),
      Buffer.from(`Content-Disposition: form-data; name="file"; filename="test-schools.xlsx"\r\n`),
      Buffer.from('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\r\n\r\n'),
      fileBuffer,
      Buffer.from(`\r\n--${boundary}--\r\n`)
    ]);

    const uploadOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/schools/upload-excel',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': formData.length,
        'Authorization': `Bearer ${token}`
      }
    };

    return new Promise((resolve, reject) => {
      const req = http.request(uploadOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          console.log('\n--- Upload Response ---');
          try {
            const result = JSON.parse(data);
            console.log(JSON.stringify(result, null, 2));
          } catch (e) {
            console.log(data);
          }
        });
      });
      req.on('error', (e) => console.log('Upload error:', e.message));
      req.write(formData);
      req.end();
    });
  }
};

loginAndUpload();