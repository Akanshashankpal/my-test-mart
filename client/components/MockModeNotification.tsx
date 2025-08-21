import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MockModeNotification() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMockMode, setIsMockMode] = useState(false);

  useEffect(() => {
    const checkMockMode = () => {
      const mockMode = localStorage.getItem('electromart_mock_mode');
      const isInMockMode = mockMode === 'true';
      setIsMockMode(isInMockMode);
      setIsVisible(isInMockMode);
    };

    // Check on mount
    checkMockMode();

    // Listen for storage changes
    const handleStorageChange = () => {
      checkMockMode();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically in case localStorage changes within the same tab
    const interval = setInterval(checkMockMode, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  if (!isVisible || !isMockMode) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
      <Alert className="border-orange-200 bg-orange-50 shadow-lg">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <div className="flex items-center justify-between">
          <AlertDescription className="text-orange-800 pr-2">
            <strong>Demo Mode:</strong> API unavailable, using mock data
          </AlertDescription>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="h-6 w-6 p-0 text-orange-600 hover:text-orange-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Alert>
    </div>
  );
}
