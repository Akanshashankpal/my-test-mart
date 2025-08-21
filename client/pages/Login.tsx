import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { healthCheck } from '@/lib/api';
import { Store, Lock, Mail, Eye, EyeOff, Loader2, Wifi, WifiOff, CheckCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const { login, isLoading, error: authError } = useAuth();

  // Check API connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const result = await healthCheck();
        setConnectionStatus(result.success ? 'connected' : 'disconnected');
      } catch (error) {
        setConnectionStatus('disconnected');
      }
    };

    checkConnection();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    // Validation
    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      setLocalError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    const success = await login(email, password);
    if (!success) {
      // Error is now handled in AuthContext
      console.log('Login failed');
    }
  };

  // Combined error from local validation and auth context
  const displayError = localError || authError;

  const demoCredentials = [
    { email: 'admin@example.com', password: 'password123', role: 'Admin' },
    { email: 'manager@example.com', password: 'password123', role: 'Manager' },
    { email: 'cashier@example.com', password: 'password123', role: 'Cashier' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-electric-blue/5 via-white to-electric-purple/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-blue-600 text-white p-3 rounded-xl shadow-lg">
              <Store className="h-8 w-8" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-gray-900">ElectroMart</h1>
              <p className="text-sm text-gray-600">Business Management</p>
            </div>
          </div>

          {/* Connection Status */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {connectionStatus === 'checking' && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Checking connection...</span>
              </div>
            )}
            {connectionStatus === 'connected' && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Connected to server</span>
              </div>
            )}
            {connectionStatus === 'disconnected' && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <WifiOff className="h-4 w-4" />
                <span>Server connection failed</span>
              </div>
            )}
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Welcome Back</h2>
          <p className="text-gray-600">Sign in to your business dashboard</p>
        </div>

        {/* Login Form */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-center">
              {isSignup ? 'Sign Up' : 'Sign In'}
            </CardTitle>
            <CardDescription className="text-center">
              Access your business management dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@electromart.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-11"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {displayError && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">
                    {displayError}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading || connectionStatus === 'disconnected'}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Use the demo credentials below to test the application
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card className="shadow-lg border-electric-blue/20 bg-electric-blue/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-electric-blue">Demo Credentials</CardTitle>
            <CardDescription className="text-electric-blue/80">
              Use these credentials to test the application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {demoCredentials.map((cred, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-electric-blue/20 cursor-pointer hover:bg-electric-blue/5 transition-colors"
                onClick={() => {
                  setEmail(cred.email);
                  setPassword(cred.password);
                }}
              >
                <div>
                  <p className="font-medium text-electric-blue">{cred.role}</p>
                  <p className="text-sm text-electric-blue/80">{cred.email}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-electric-blue hover:text-electric-blue/80 hover:bg-electric-blue/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEmail(cred.email);
                    setPassword(cred.password);
                  }}
                >
                  Use
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600">
          © 2024 ElectroMart. All rights reserved.
        </p>
      </div>
    </div>
  );
}
