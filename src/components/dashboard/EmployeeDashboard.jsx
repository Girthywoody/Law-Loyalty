//src/components/dashboard/EmployeeDashboard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RESTAURANTS } from '@/constants/restaurants';

const EmployeeDashboard = ({ userData }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const navigate = useNavigate();

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const handleRestaurantChange = (value) => {
    setSelectedRestaurant(value);
    setSelectedLocation('');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Card className="max-w-md mx-auto bg-white shadow-lg">
        <CardHeader className="flex justify-between items-center border-b p-4">
          <div>
            <h1 className="text-xl font-bold">JLaw Enterprise</h1>
          </div>
          <Button 
            variant="ghost"
            onClick={() => navigate('/logout')}
            className="text-gray-600 hover:text-gray-800"
          >
            Sign Out
          </Button>
        </CardHeader>

        <CardContent className="p-4 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-lg font-semibold">{userData?.name || 'Employee Name'}</h2>
            <p className="text-gray-600">{selectedRestaurant || 'Select Restaurant'}</p>
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full inline-block">
              Verified
            </div>
          </div>

          <div className="text-center text-2xl font-bold">
            {formatTime(currentTime)}
          </div>
          
          <div className="text-center text-gray-600">
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Current Benefits</h3>
            <div className="space-y-2">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-blue-800">Meal Allowance Active</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-blue-800">
                  Employee Discount {userData?.discount || '20%'}
                </p>
              </div>
            </div>
          </div>

          <Select
            value={selectedRestaurant}
            onValueChange={handleRestaurantChange}
            placeholder="Select Restaurant"
          >
            {RESTAURANTS.map(restaurant => (
              <option key={restaurant.id} value={restaurant.id}>
                {restaurant.name}
              </option>
            ))}
          </Select>

          {selectedRestaurant && 
           RESTAURANTS.find(r => r.id === selectedRestaurant)?.locations && (
            <Select
              value={selectedLocation}
              onValueChange={setSelectedLocation}
              placeholder="Select Location"
            >
              {RESTAURANTS.find(r => r.id === selectedRestaurant)?.locations.map(location => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </Select>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeDashboard;