import React, { useState } from 'react';
import { User, Mail, Building, ArrowLeft } from 'lucide-react';
import { registerEmployee } from '../services/firebaseService';
import { RESTAURANTS } from './restaurants';

const RegisterPage = ({ onBack }) => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    selectedRestaurant: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Get all restaurant options including locations
  const getAllRestaurantOptions = () => {
    return RESTAURANTS.flatMap(restaurant => {
      if (restaurant.locations) {
        return restaurant.locations.map(location => ({
          id: `${restaurant.id}-${location.id}`,
          name: `${restaurant.name} - ${location.name}`,
          parentName: restaurant.name
        }));
      }
      return [{
        id: restaurant.id,
        name: restaurant.name,
        parentName: restaurant.name
      }];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!form.firstName || !form.lastName || !form.email || !form.selectedRestaurant) {
        throw new Error('Please fill in all fields');
      }

      // Email validation
      const emailDomain = form.email.split('@')[1];
      if (!emailDomain || !emailDomain.includes('.')) {
        throw new Error('Please enter a valid email address');
      }

      // Register employee
      await registerEmployee({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        selectedRestaurant: form.selectedRestaurant
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
        <div className="w-full max-w-sm text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Registration Pending</h2>
          <p className="text-gray-600 mb-6">
            Your registration has been submitted and is pending approval from the restaurant manager.
            You will receive an email once your registration has been approved.
          </p>
          <button
            onClick={onBack}
            className="inline-flex items-center justify-center gap-2 text-violet-600 hover:text-violet-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-purple-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <button
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 text-violet-600 hover:text-violet-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Employee Registration</h2>

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
              />
            </div>
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
              className="w-full pl-10 px-4 py-3 rounded-xl bg-white border border-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="relative">
            <Building className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <select
              value={form.selectedRestaurant}
              onChange={(e) => setForm(prev => ({ ...prev, selectedRestaurant: e.target.value }))}
              className="w-full pl-10 px-4 py-3 rounded-xl bg-white border border-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all appearance-none"
            >
              <option value="">Select Restaurant</option>
              {getAllRestaurantOptions().map(option => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white py-3 rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg shadow-violet-200 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Registration'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;