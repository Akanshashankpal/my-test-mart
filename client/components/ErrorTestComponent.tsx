import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { handleAPIError, showAPIError } from '@/lib/api';
import { authAPI, customersAPI, productsAPI } from '@/lib/api';

export default function ErrorTestComponent() {
  const testNetworkError = () => {
    const networkError = {
      message: 'Network Error: Please check your connection'
    };
    const result = handleAPIError(networkError, 'Default message');
    alert(`Network Error Test: ${result}`);
  };

  const testValidationError = () => {
    const validationError = {
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
    };
    const result = handleAPIError(validationError, 'Default message');
    alert(`Validation Error Test: ${result}`);
  };

  const testServerError = () => {
    const serverError = {
      response: {
        status: 500,
        data: {
          error: 'Internal server error occurred'
        }
      }
    };
    const result = handleAPIError(serverError, 'Default message');
    alert(`Server Error Test: ${result}`);
  };

  const testObjectError = () => {
    const objectError = {
      response: {
        status: 400,
        data: { someObject: { nested: true } }
      }
    };
    const result = handleAPIError(objectError, 'Default message');
    alert(`Object Error Test: ${result}`);
  };

  const testRealAPIError = async () => {
    try {
      // This should fail and trigger our error handling
      await authAPI.login('invalid@test.com', 'wrongpassword');
    } catch (error: any) {
      const result = handleAPIError(error, 'Login failed');
      alert(`Real API Error Test: ${result}`);
    }
  };

  const testCustomersAPIError = async () => {
    try {
      // This might fail if API is not available
      await customersAPI.getCustomers();
    } catch (error: any) {
      const result = handleAPIError(error, 'Failed to fetch customers');
      alert(`Customers API Error Test: ${result}`);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto m-4">
      <CardHeader>
        <CardTitle>Error Handling Test Component</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 mb-4">
          This component tests the API error handling fixes. Click the buttons below to test different error scenarios.
        </p>
        
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={testNetworkError} variant="outline">
            Test Network Error
          </Button>
          
          <Button onClick={testValidationError} variant="outline">
            Test Validation Error
          </Button>
          
          <Button onClick={testServerError} variant="outline">
            Test Server Error
          </Button>
          
          <Button onClick={testObjectError} variant="outline">
            Test Object Error
          </Button>
          
          <Button onClick={testRealAPIError} variant="outline">
            Test Real API Error
          </Button>
          
          <Button onClick={testCustomersAPIError} variant="outline">
            Test Customers API
          </Button>
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2">Expected Results:</h4>
          <ul className="text-sm space-y-1">
            <li>• All error messages should be user-friendly text</li>
            <li>• No "[object Object]" should appear in any alert</li>
            <li>• Validation errors should show specific field errors</li>
            <li>• Network errors should mention connection issues</li>
            <li>• Object errors should show HTTP status codes</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
