// src/components/auth/Register.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";import { RESTAURANTS } from '../../constants/restaurants';
import { registerUser } from '../../firebase/config';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    restaurant: '',
    location: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const selectedRestaurant = RESTAURANTS.find(r => r.id === formData.restaurant);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await registerUser(formData.email, formData.password, {
        name: formData.name,
        role: 'employee',
        restaurantId: formData.restaurant,
        locationId: formData.location || null,
        status: 'pending'
      });

      // Redirect to login page after successful registration
      navigate('/login', { 
        state: { message: 'Registration successful! Please check your email for verification.' }
      });
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-bold text-center">JLaw Enterprise</h1>
          <p className="text-center text-gray-600">Create your account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm Password</label>
              <Input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Restaurant</label>
                <Select
                    value={formData.restaurant}
                    onValueChange={(value) => setFormData({ ...formData, restaurant: value, location: '' })}
                >
                    <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a restaurant" />
                    </SelectTrigger>
                    <SelectContent>
                    {RESTAURANTS.map(restaurant => (
                        <SelectItem key={restaurant.id} value={restaurant.id}>
                        {restaurant.name}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                </div>

                {selectedRestaurant?.locations && (
                <div className="space-y-2">
                    <label className="text-sm font-medium">Location</label>
                    <Select
                    value={formData.location}
                    onValueChange={(value) => setFormData({ ...formData, location: value })}
                    >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a location" />
                    </SelectTrigger>
                    <SelectContent>
                        {selectedRestaurant.locations.map(location => (
                        <SelectItem key={location.id} value={location.id}>
                            {location.name}
                        </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>
                )}

            <Button type="submit" className="w-full">
              Register
            </Button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:underline"
              >
                Login here
              </button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;