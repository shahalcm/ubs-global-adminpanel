import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Removed unused react-form import
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('admin@ubsglobal.com');
  const [password, setPassword] = useState('Admin@123456');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Successfully logged in!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
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

      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-[#F4F7FE] dark:bg-dark-bg lg:bg-transparent">
        <div className="w-full max-w-md bg-white dark:bg-dark-card rounded-[24px] shadow-soft dark:shadow-soft-dark border border-gray-100 dark:border-gray-800 p-10 animate-fade-in">
          <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-gradient-primary shadow-lg shadow-primary/30 text-white rounded-2xl flex items-center justify-center font-extrabold text-2xl mx-auto mb-6 transform -rotate-3 hover:rotate-0 transition-transform">
              UB
            </div>
            <h2 className="text-3xl font-extrabold text-[#2B3674] dark:text-white tracking-tight">Welcome Back</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Sign in to your admin dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-[#2B3674] dark:text-gray-300 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-[#2B3674] dark:text-white sm:text-sm transition-all"
                  placeholder="admin@ubsglobal.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#2B3674] dark:text-gray-300 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-11 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-[#2B3674] dark:text-white sm:text-sm transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary transition-colors"
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
