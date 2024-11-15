// src/components/dashboard/admin/RestaurantOverview.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer 
} from 'recharts';
import { getRestaurantStats } from '../../../firebase/adminService';

const RestaurantOverview = () => {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const restaurantStats = await getRestaurantStats();
        setStats(restaurantStats);
      } catch (error) {
        console.error('Error fetching restaurant stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Restaurant Overview</h3>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="employees" fill="#4f46e5" name="Total Employees" />
              <Bar dataKey="activeVisits" fill="#10b981" name="Active Visits" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default RestaurantOverview;
