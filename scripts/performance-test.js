#!/usr/bin/env node

/**
 * Performance Testing Script
 * Tests critical API endpoints for response time and reliability
 */

import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = process.env.VITE_API_URL || 'http://localhost:5000';

// Test configuration
const TESTS = [
  {
    name: 'Dashboard Stats',
    endpoint: '/api/reports/dashboard',
    method: 'GET',
    expectedTime: 1000, // ms
    concurrent: 10,
  },
  {
    name: 'Users List',
    endpoint: '/api/users',
    method: 'GET',
    expectedTime: 500,
    concurrent: 20,
  },
  {
    name: 'Banking Accounts',
    endpoint: '/api/banking/accounts',
    method: 'GET',
    expectedTime: 500,
    concurrent: 20,
  },
  {
    name: 'Sales Invoices',
    endpoint: '/api/sales/invoices',
    method: 'GET',
    expectedTime: 800,
    concurrent: 15,
  },
  {
    name: 'Profit & Loss Report',
    endpoint: '/api/reports/profit-loss',
    method: 'GET',
    expectedTime: 2000,
    concurrent: 5,
  },
];

/**
 * Make HTTP request with timing
 */
async function makeRequest(url, method = 'GET', headers = {}) {
  const startTime = Date.now();
  
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    return {
      success: response.ok,
      status: response.status,
      duration,
      error: null,
    };
  } catch (error) {
    const endTime = Date.now();
    return {
      success: false,
      status: 0,
      duration: endTime - startTime,
      error: error.message,
    };
  }
}

/**
 * Run concurrent requests
 */
async function runConcurrentTest(test, sessionCookie) {
  const promises = [];
  
  for (let i = 0; i < test.concurrent; i++) {
    promises.push(
      makeRequest(`${BASE_URL}${test.endpoint}`, test.method, {
        Cookie: sessionCookie,
      })
    );
  }
  
  const results = await Promise.all(promises);
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const durations = results.map(r => r.duration);
  const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);
  
  return {
    name: test.name,
    endpoint: test.endpoint,
    concurrent: test.concurrent,
    successful,
    failed,
    avgDuration: Math.round(avgDuration),
    minDuration,
    maxDuration,
    expectedTime: test.expectedTime,
    passed: avgDuration <= test.expectedTime,
  };
}

/**
 * Login and get session cookie
 */
async function login() {
  console.log('🔐 Logging in...');
  
  const response = await fetch(`${BASE_URL}/api/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: process.env.TEST_USERNAME || 'admin',
      password: process.env.TEST_PASSWORD || 'admin123',
    }),
  });
  
  if (!response.ok) {
    throw new Error('Login failed. Please check TEST_USERNAME and TEST_PASSWORD in .env');
  }
  
  const setCookieHeader = response.headers.get('set-cookie');
  if (!setCookieHeader) {
    throw new Error('No session cookie received');
  }
  
  console.log('✅ Login successful\n');
  return setCookieHeader;
}

/**
 * Main test runner
 */
async function runPerformanceTests() {
  console.log('🚀 Performance Testing Started\n');
  console.log(`📍 Base URL: ${BASE_URL}\n`);
  console.log('='.repeat(80));
  
  let sessionCookie;
  
  try {
    // Login first
    sessionCookie = await login();
  } catch (error) {
    console.error('❌ Login error:', error.message);
    console.log('\n💡 Tip: Set TEST_USERNAME and TEST_PASSWORD in .env file');
    process.exit(1);
  }
  
  // Run all tests
  const results = [];
  
  for (const test of TESTS) {
    console.log(`\n📊 Testing: ${test.name}`);
    console.log(`   Endpoint: ${test.endpoint}`);
    console.log(`   Concurrent requests: ${test.concurrent}`);
    console.log(`   Expected time: ${test.expectedTime}ms`);
    
    const result = await runConcurrentTest(test, sessionCookie);
    results.push(result);
    
    const passIcon = result.passed ? '✅' : '⚠️';
    console.log(`   ${passIcon} Avg duration: ${result.avgDuration}ms`);
    console.log(`   Range: ${result.minDuration}ms - ${result.maxDuration}ms`);
    console.log(`   Success rate: ${result.successful}/${test.concurrent}`);
    
    if (result.failed > 0) {
      console.log(`   ❌ Failed requests: ${result.failed}`);
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('\n📈 Performance Test Summary\n');
  
  const allPassed = results.every(r => r.passed);
  const passedCount = results.filter(r => r.passed).length;
  const totalRequests = results.reduce((sum, r) => sum + r.concurrent, 0);
  const totalSuccessful = results.reduce((sum, r) => sum + r.successful, 0);
  const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);
  
  console.log(`✅ Passed tests: ${passedCount}/${results.length}`);
  console.log(`📊 Total requests: ${totalRequests}`);
  console.log(`✅ Successful: ${totalSuccessful}`);
  console.log(`❌ Failed: ${totalFailed}`);
  console.log(`📈 Success rate: ${((totalSuccessful / totalRequests) * 100).toFixed(1)}%`);
  
  console.log('\n📋 Detailed Results:\n');
  results.forEach(r => {
    const icon = r.passed ? '✅' : '⚠️';
    const comparison = r.avgDuration <= r.expectedTime 
      ? `(${r.expectedTime - r.avgDuration}ms under target)`
      : `(${r.avgDuration - r.expectedTime}ms over target)`;
    console.log(`${icon} ${r.name}: ${r.avgDuration}ms avg ${comparison}`);
  });
  
  if (allPassed) {
    console.log('\n🎉 All performance tests passed!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests exceeded expected response time');
    console.log('💡 Consider:');
    console.log('   - Adding more database indexes');
    console.log('   - Increasing Redis cache TTL');
    console.log('   - Optimizing slow queries');
    process.exit(1);
  }
}

// Run tests
runPerformanceTests().catch(error => {
  console.error('\n❌ Test error:', error.message);
  console.error(error.stack);
  process.exit(1);
});
