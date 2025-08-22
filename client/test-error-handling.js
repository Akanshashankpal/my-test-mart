// Test script to verify API error handling
// Run this in browser console to test error handling

console.log('Testing API Error Handling...');

// Test 1: Check if error handling utility functions are available
if (typeof window.handleAPIError === 'function') {
  console.log('✅ handleAPIError utility function is available');
  
  // Test with mock error object
  const mockError = {
    response: {
      status: 404,
      data: {
        message: 'User not found'
      }
    }
  };
  
  const result = window.handleAPIError(mockError, 'Default message');
  console.log('Test result:', result);
  
  if (result === 'User not found') {
    console.log('✅ Error message extraction working correctly');
  } else {
    console.log('❌ Error message extraction failed');
  }
} else {
  console.log('❌ handleAPIError utility function not available');
}

// Test 2: Check if API connection test is available
if (typeof window.testAPIConnection === 'function') {
  console.log('✅ testAPIConnection function is available');
  
  // Test API connection
  window.testAPIConnection().then(result => {
    console.log('API Connection Test Result:', result);
  }).catch(error => {
    console.log('API Connection Test Error:', error);
  });
} else {
  console.log('❌ testAPIConnection function not available');
}

// Test 3: Simulate different error types
const testErrorTypes = [
  {
    name: 'Network Error',
    error: { message: 'Network Error: Please check your connection' }
  },
  {
    name: 'Validation Error',
    error: {
      response: {
        status: 422,
        data: {
          message: 'Validation failed',
          errors: {
            email: ['Email is required'],
            password: ['Password must be at least 8 characters']
          }
        }
      }
    }
  },
  {
    name: 'Server Error',
    error: {
      response: {
        status: 500,
        data: {
          error: 'Internal server error occurred'
        }
      }
    }
  },
  {
    name: 'Generic Object Error (should not show [object Object])',
    error: {
      response: {
        status: 400,
        data: { someObject: { nested: true } }
      }
    }
  }
];

testErrorTypes.forEach(test => {
  console.log(`\nTesting ${test.name}:`);
  if (typeof window.handleAPIError === 'function') {
    const result = window.handleAPIError(test.error);
    console.log(`Result: "${result}"`);
    
    if (result.includes('[object Object]')) {
      console.log('❌ Still showing [object Object]');
    } else {
      console.log('✅ No [object Object] found');
    }
  }
});

console.log('\nError handling test completed!');
