import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../hooks/useRedux';
import { login } from '../store/slices/authSlice';
import InputField from '../components/ui/InputField';
import Button from '../components/ui/Button';
import { Mail, Lock, Eye, EyeOff, AlertTriangle, Sparkles } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleUsernameChange = React.useCallback((value: string) => {
    setUsername(value);
  }, []);

  const handlePasswordChange = React.useCallback((value: string) => {
    setPassword(value);
  }, []);

  const validateForm = () => {
    const newErrors: { username?: string; password?: string } = {};
    
    if (!username.trim()) {
      newErrors.username = 'Username is required';
    } else if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(async () => {
      try {
        // Fetch user from API
        const response = await fetch(`http://localhost:3001/users?username=${username.trim()}`);
        const users = await response.json();
        
        if (users.length > 0 && users[0].status === 'active') {
          console.log('🔑 Found user in database:', users[0]);
          dispatch(login(users[0]));
          navigate('/dashboard');
        } else {
          // For demo, create a default user if not found
          const defaultUser = {
            id: Date.now().toString(),
            username: username.trim(),
            email: `${username.trim()}@wellsfargo.com`,
            role: 'Admin' as const,
            status: 'active' as const,
            createdAt: new Date().toISOString(),
          };
          console.log('🔑 Creating default user:', defaultUser);
          dispatch(login(defaultUser));
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Login error:', error);
        // Fallback for demo
        const fallbackUser = {
          id: Date.now().toString(),
          username: username.trim(),
          email: `${username.trim()}@wellsfargo.com`,
          role: 'Admin' as const,
          status: 'active' as const,
          createdAt: new Date().toISOString(),
        };
        dispatch(login(fallbackUser));
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background-cream to-accent-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-bounce-gentle"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-bounce-gentle" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-primary-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-bounce-gentle" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20 animate-fade-in">
          {/* Logo and Branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl mb-4 shadow-lg">
              <AlertTriangle className="h-10 w-10 text-white" />
            </div>
            <div className="flex items-center justify-center space-x-2 mb-2">
              <h1 className="text-2xl font-bold text-primary-700">
                Alerts Studio
              </h1>
              <Sparkles className="h-5 w-5 text-accent-500 animate-pulse" />
            </div>
            <p className="text-primary-600 font-medium mb-2">Wells Fargo</p>
            <p className="text-gray-600 text-sm">
              Sign in to manage your notification templates
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="animate-slide-up">
              <InputField
                label="Username"
                value={username}
                onChange={handleUsernameChange}
                placeholder="Enter your username"
                error={errors.username}
                required
              />
            </div>
            
            <div className="relative animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <InputField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handlePasswordChange}
                placeholder="Enter your password"
                error={errors.password}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-primary-600 dark:hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            
            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Mail className="h-5 w-5 mr-2" />
                    Sign In
                  </div>
                )}
              </Button>
            </div>
          </form>
          
          <div className="mt-8 text-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg p-4 border border-primary-100">
              <p className="text-sm text-primary-700 font-medium mb-2">Demo Accounts</p>
              <div className="space-y-1 text-xs text-primary-600">
                <p><strong>admin</strong> → Full Access (Create, Edit, Delete)</p>
                <p><strong>editor</strong> → Create, Edit Only</p>
                <p><strong>viewer</strong> → Read Only Access</p>
                <p className="text-gray-500 mt-2">Password: any 6+ characters</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;