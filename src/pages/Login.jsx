import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Removed unused react-form import
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('shahal@gmail.com');
  const [password, setPassword] = useState('shahalpanayi');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      login(email, password);
      toast.success('Successfully logged in!');
      navigate('/dashboard');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="flex h-screen w-full bg-[#f8fafc]">
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 bg-gradient-primary p-12 text-white relative overflow-hidden">
        {/* Animated Globe Background placeholder */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent"></div>
        
        <div className="relative z-10 text-center max-w-lg">
          <h1 className="text-5xl font-bold mb-4 tracking-tight">UBS Global</h1>
          <p className="text-xl text-blue-100 mb-12">Manage Your Global Marketplace</p>
          
          <div className="flex justify-center space-x-8 text-sm font-medium text-blue-100">
            <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
              <ShieldCheck size={18} className="text-green-400" />
              <span>Secure</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
              <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">✓</div>
              <span>Verified</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
              <span className="text-lg">🏢</span>
              <span>Enterprise</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-white lg:bg-transparent">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="mb-8 text-center">
            <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center font-bold text-xl mx-auto mb-4">
              UB
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome Back, Admin</h2>
            <p className="text-gray-500 mt-2">Sign in to your admin account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-accent focus:border-accent sm:text-sm transition-colors"
                  placeholder="admin@ubsglobal.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-accent focus:border-accent sm:text-sm transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <a href="#" className="text-sm font-medium text-accent hover:text-blue-500">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center text-xs text-gray-500">
              <Lock size={12} className="mr-1" />
              256-bit SSL encryption
            </div>
            <span className="text-xs text-gray-400">v2.0.1</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
