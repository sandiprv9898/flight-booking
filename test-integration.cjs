const { io } = require('socket.io-client');
const axios = require('axios');

console.log('🔍 Testing Frontend-Backend Integration...\n');

// Test 1: Backend API Health Check
async function testBackendHealth() {
  console.log('📡 Testing Backend Health...');
  try {
    const response = await axios.get('http://localhost:5000/health');
    console.log('✅ Backend Health:', response.data.status);
    console.log('📊 Services:', response.data.services);
    return true;
  } catch (error) {
    console.log('❌ Backend Health Failed:', error.message);
    return false;
  }
}

// Test 2: Flight Search API
async function testFlightSearch() {
  console.log('\n🛩️  Testing Flight Search API...');
  try {
    const response = await axios.get('http://localhost:5000/api/v1/flights/search', {
      params: {
        origin: 'JFK',
        destination: 'LAX',
        departureDate: '2025-09-01',
        passengers: 1
      }
    });
    console.log('✅ Flight Search API:', response.data.success);
    console.log('📊 Results Count:', response.data.data?.outbound?.length || 0);
    return true;
  } catch (error) {
    console.log('❌ Flight Search Failed:', error.message);
    return false;
  }
}

// Test 3: Socket.IO Connection
async function testSocketConnection() {
  console.log('\n🔌 Testing Socket.IO Connection...');
  return new Promise((resolve) => {
    const socket = io('http://localhost:5000', {
      timeout: 5000,
      forceNew: true
    });

    const timeout = setTimeout(() => {
      console.log('❌ Socket.IO Connection Timeout');
      socket.disconnect();
      resolve(false);
    }, 5000);

    socket.on('connect', () => {
      console.log('✅ Socket.IO Connected:', socket.id);
      clearTimeout(timeout);
      socket.disconnect();
      resolve(true);
    });

    socket.on('connect_error', (error) => {
      console.log('❌ Socket.IO Connection Failed:', error.message);
      clearTimeout(timeout);
      resolve(false);
    });
  });
}

// Test 4: Frontend Accessibility
async function testFrontendAccess() {
  console.log('\n🌐 Testing Frontend Accessibility...');
  try {
    const response = await axios.get('http://localhost:3074/');
    console.log('✅ Frontend Accessible:', response.status === 200);
    console.log('📄 Content Type:', response.headers['content-type']);
    return true;
  } catch (error) {
    console.log('❌ Frontend Access Failed:', error.message);
    return false;
  }
}

// Run all tests
async function runIntegrationTests() {
  console.log('='.repeat(50));
  console.log('  FLIGHT BOOKING INTEGRATION TESTS');
  console.log('='.repeat(50));

  const results = {
    backendHealth: await testBackendHealth(),
    flightSearch: await testFlightSearch(),
    socketConnection: await testSocketConnection(),
    frontendAccess: await testFrontendAccess()
  };

  console.log('\n' + '='.repeat(50));
  console.log('  TEST RESULTS SUMMARY');
  console.log('='.repeat(50));

  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASSED' : '❌ FAILED';
    const testName = test.replace(/([A-Z])/g, ' $1').trim();
    console.log(`${status.padEnd(10)} ${testName.charAt(0).toUpperCase() + testName.slice(1)}`);
  });

  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log('\n📊 Overall Status:', `${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All integration tests PASSED! Frontend and Backend are working together.');
  } else {
    console.log('⚠️  Some tests FAILED. Check the logs above for details.');
  }

  process.exit(0);
}

runIntegrationTests();