import React, { useState } from 'react';
import { Mail, Lock, Coffee } from 'lucide-react';
import { loginUser, resetPassword } from '../services/firebaseService';
import RegisterPage from './RegisterPage';

const LoginPage = ({ onLogin }) => {
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { user, userData } = await loginUser(loginForm.email, loginForm.password);
      
      if (!user.emailVerified) {
        setError('Please verify your email before logging in.');
        setLoading(false);
        return;
      }

      onLogin(true, userData.role);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!loginForm.email) {
      setError('Please enter your email address');
      return;
    }

    try {
      await resetPassword(loginForm.email);
      setResetSent(true);
      setError('');
    } catch (error) {
      setError(error.message);
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

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {resetSent && (
            <div className="p-3 bg-green-50 text-green-600 rounded-lg text-sm">
              Password reset instructions have been sent to your email.
            </div>
          )}

          <div className="text-right">
            <button 
              type="button" 
              onClick={handlePasswordReset}
              className="text-sm text-violet-600 hover:text-violet-700"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white py-3 rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg shadow-violet-200 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

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
    </div>
  );
};

export default LoginPage;