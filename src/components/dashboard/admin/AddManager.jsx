// src/components/dashboard/admin/AddManager.jsx
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { addManager } from '../../../firebase/adminService';
import { RESTAURANTS } from '../../../constants/restaurants';

const AddManager = ({ onManagerAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    restaurantId: '',
    locationId: ''
  });
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addManager(formData);
      setFormData({ name: '', email: '', restaurantId: '', locationId: '' });
      onManagerAdded();
    } catch (error) {
      console.error('Error adding manager:', error);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Restaurant</label>
            <Select
              value={formData.restaurantId}
              onValueChange={(value) => {
                const restaurant = RESTAURANTS.find(r => r.id === value);
                setSelectedRestaurant(restaurant);
                setFormData({ ...formData, restaurantId: value, locationId: '' });
              }}
            >
              {RESTAURANTS.map(restaurant => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </Select>
          </div>

          {selectedRestaurant?.locations && (
            <div>
              <label className="text-sm font-medium">Location</label>
              <Select
                value={formData.locationId}
                onValueChange={(value) => setFormData({ ...formData, locationId: value })}
              >
                {selectedRestaurant.locations.map(location => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </Select>
            </div>
          )}

          <Button type="submit" className="w-full">
            Add Manager
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddManager;
