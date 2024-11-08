import React, { useState } from 'react';
import { Mail, User, Building, ArrowLeft, Coffee, Check, Loader } from 'lucide-react';
import { registerEmployee } from '../services/firebaseService';

const RegisterPage = ({ onBack }) => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '', // Added password field
    selectedRestaurant: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await registerEmployee({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        restaurant: form.selectedRestaurant
      });

      setSuccess(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 to-purple-50 flex flex-col items-center justify-center p-6">
        <div className="w-20 h-20 bg-green-600 rounded-2xl mb-6 flex items-center justify-center">
          <Check className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-green-600 mb-4">Registration Successful!</h2>
        <div className="text-gray-600 mb-6 text-center max-w-sm space-y-3">
          <p>Your registration is pending manager approval.</p>
          <p>Please check your email and verify your account.</p>
        </div>
        <button
          onClick={onBack}
          className="text-violet-600 hover:text-violet-700 font-medium flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-purple-50 flex flex-col items-center justify-center p-6">
      <div className="w-20 h-20 bg-violet-600 rounded-2xl mb-6 flex items-center justify-center">
        <Coffee className="w-12 h-12 text-white" />
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
          Employee Registration
        </h1>
        <p className="text-gray-600 mt-2">Fill in your details to get started</p>
      </div>

      <div className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="First Name"
                value={form.firstName}
                onChange={(e) => setForm(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full pl-10 px-4 py-3 rounded-xl bg-white border border-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                required
              />
            </div>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Last Name"
                value={form.lastName}
                onChange={(e) => setForm(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full pl-10 px-4 py-3 rounded-xl bg-white border border-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="email"
              placeholder="Work Email"
              value={form.email}
              onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
              className="w-full pl-10 px-4 py-3 rounded-xl bg-white border border-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
              className="w-full pl-10 px-4 py-3 rounded-xl bg-white border border-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="relative">
            <Building className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <select
              value={form.selectedRestaurant}
              onChange={(e) => setForm(prev => ({ ...prev, selectedRestaurant: e.target.value }))}
              className="w-full pl-10 px-4 py-3 rounded-xl bg-white border border-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all appearance-none"
              required
            >
              <option value="">Select Restaurant</option>
              {RESTAURANTS.map((restaurant) => (
                restaurant.locations ? (
                  restaurant.locations.map(location => (
                    <option key={`${restaurant.name}-${location}`} value={`${restaurant.name} - ${location}`}>
                      {restaurant.name} - {location}
                    </option>
                  ))
                ) : (
                  <option key={restaurant.name} value={restaurant.name}>
                    {restaurant.name}
                  </option>
                )
              ))}
            </select>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white py-3 rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg shadow-violet-200 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader className="w-5 h-5 animate-spin" />
                Registering...
              </div>
            ) : (
              'Register'
            )}
          </button>
        </form>

        <button
          onClick={onBack}
          className="mt-6 text-gray-600 hover:text-gray-800 transition-colors mx-auto block flex items-center gap-2 justify-center"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default RegisterPage;