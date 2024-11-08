import React, { useState } from 'react';
import { Mail, Lock, Coffee } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import RegisterPage from './RegisterPage';

const LoginPage = () => {
  const { login } = useAuth();
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(loginForm.email, loginForm.password);
    } catch (error) {
      setError('Failed to sign in: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (showRegister) {
    return <RegisterPage onBack={() => setShowRegister(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-purple-50 flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="w-20 h-20 bg-violet-600 rounded-2xl mb-6 flex items-center justify-center">
        <Coffee className="w-12 h-12 text-white" />
      </div>

      {/* App Name */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
          Law Loyalty
        </h1>
      </div>

      {/* Login Form */}
      <div className="w-full max-w-sm">
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="email"
              placeholder="Email"
              value={loginForm.email}
              onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
              className="w-full pl-10 px-4 py-3 rounded-xl bg-white border border-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
              className="w-full pl-10 px-4 py-3 rounded-xl bg-white border border-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="text-right">
            <button type="button" className="text-sm text-violet-600 hover:text-violet-700">
              Forget Password
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white py-3 rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg shadow-violet-200"
          >
            Sign In
          </button>
        </form>

        {/* Demo credentials */}
        <div className="mt-6 p-4 bg-violet-50 rounded-lg">
          <p className="font-medium text-violet-900 mb-2">Demo Access:</p>
          <div className="text-sm text-violet-800 space-y-1">
            <p>Manager: manager@jlaw.com</p>
            <p>Employee: employee@jlaw.com</p>
            <p>Password: demo123</p>
          </div>
        </div>
      </div>

      {/* Add this after the login button */}
      <div className="mt-4 text-center">
        <p className="text-gray-600">New employee?</p>
        <button
          onClick={() => setShowRegister(true)}
          className="mt-2 text-violet-600 hover:text-violet-700 font-medium"
        >
          Register here
        </button>
      </div>
    </div>
  );
};

export default LoginPage;