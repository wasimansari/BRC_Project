const http = require('http');
const jwt = require('../server/node_modules/jsonwebtoken');

const JWT_SECRET = 'brc_secret_2024_Akram0031';
// Sample teacher ID from database
const token = jwt.sign(
  { id: '6742d4567890abcdef123456', udiseCode: '10021507703', role: 'teacher' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(JSON.stringify(postData));
    req.end();
  });
}

async function runTest() {
  console.log('Testing Teacher Profile & Endorsement API...');

  // Sample tiny 1x1 png base64 for testing signature and seal
  const testBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  // 1. PUT /api/teacher/profile
  const updateRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/teacher/profile',
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, {
    headmasterName: 'DAYA SHANKAR PRASAD',
    headmasterDesignation: 'Head Master (प्रधानाध्यापक)',
    headmasterSignatureUrl: testBase64,
    schoolSealUrl: testBase64
  });

  console.log('PUT /api/teacher/profile status:', updateRes.status, updateRes.body?.message || updateRes.body);
  if (updateRes.body?.teacher) {
    console.log('Headmaster Name:', updateRes.body.teacher.headmasterName);
    console.log('Headmaster Designation:', updateRes.body.teacher.headmasterDesignation);
    console.log('Has Signature:', !!updateRes.body.teacher.headmasterSignatureUrl);
    console.log('Has Seal:', !!updateRes.body.teacher.schoolSealUrl);
  }

  // 2. GET /api/teacher/profile
  const getRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/teacher/profile',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  console.log('GET /api/teacher/profile status:', getRes.status);
  if (getRes.body?.teacher) {
    console.log('Retrieved Headmaster Name:', getRes.body.teacher.headmasterName);
  }

  console.log('Teacher Profile & Endorsement test completed!');
}

runTest().catch(console.error);
