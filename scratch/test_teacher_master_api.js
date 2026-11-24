const http = require('http');
const jwt = require('../server/node_modules/jsonwebtoken');

const JWT_SECRET = 'brc_secret_2024_Akram0031';
const token = jwt.sign(
  { id: '6742d4567890abcdef123456', udiseCode: '10021507703', schoolName: 'UHS MAHAMMADPUR MAJHAULIA' },
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
  console.log('Testing Teacher Master Endpoints...');
  
  // 1. GET /api/teacher-master
  const getRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/teacher-master?udiseCode=10021507703',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  console.log('GET /api/teacher-master status:', getRes.status);
  console.log('Count returned:', getRes.body?.count, 'Teachers count in data:', getRes.body?.data?.length);
  if (getRes.body?.data?.length > 0) {
    const t0 = getRes.body.data[0];
    console.log('Sample Teacher 1:', t0.teacherName, '| Type:', t0.teacherType, '| Basic:', t0.basicPay, '| ID:', t0.teacherId);
  }

  // 2. POST /api/teacher-master (Add a new teacher)
  const addRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/teacher-master',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, {
    teacherName: 'TEST TEACHER BIHAR',
    teacherType: 'TRE-2',
    teacherClass: '9-10th',
    pranNo: '110999999999',
    dob: '01-01-1992',
    teacherId: '99887766',
    accountNo: '333344445555',
    basicPay: 34000,
    customFields: { BloodGroup: 'B+', Mobile: '9876543210' }
  });

  console.log('POST /api/teacher-master status:', addRes.status, 'Created ID:', addRes.body?.data?._id);

  if (addRes.body?.data?._id) {
    // Delete the test teacher
    const delRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/teacher-master/${addRes.body.data._id}`,
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('DELETE test teacher status:', delRes.status, delRes.body?.message);
  }

  console.log('All Teacher Master tests completed successfully!');
}

runTest().catch(console.error);
