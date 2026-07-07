const axios = require('axios');

async function testAuthFlow() {
  const api = axios.create({ baseURL: 'http://localhost:5000/api' });
  
  try {
    const email = `testuser_${Date.now()}@example.com`;
    console.log('1. Signing up user...');
    const signupRes = await api.post('/auth/signup', {
      name: 'Test User',
      email,
      password: 'Password123!'
    });
    console.log('Signup successful:', signupRes.data.success);
    
    console.log('2. Logging in...');
    const loginRes = await api.post('/auth/login', {
      email,
      password: 'Password123!'
    });
    console.log('Login successful:', loginRes.data.success);
    console.log('Token received:', !!loginRes.data.token);
    
    console.log('All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('Test failed:');
    if (error.response) {
      console.error(error.response.data);
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

testAuthFlow();
