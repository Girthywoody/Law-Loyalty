// src/components/dashboard/admin/ManagerDetails.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { getManagerStats } from '../../../firebase/adminService';

const ManagerDetails = ({ managerId }) => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const managerStats = await getManagerStats(managerId);
        setStats(managerStats);
      } catch (error) {
        console.error('Error fetching manager stats:', error);
      }
    };

    if (managerId) {
      fetchStats();
    }
  }, [managerId]);

  if (!stats) return null;

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Manager Statistics</h3>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Employees</p>
            <p className="text-2xl font-bold text-blue-600">
              {stats.totalEmployees}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Active Employees</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.activeEmployees}
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Pending Employees</p>
            <p className="text-2xl font-bold text-yellow-600">
              {stats.pendingEmployees}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Average Discount</p>
            <p className="text-2xl font-bold text-purple-600">
              {stats.averageDiscount.toFixed(1)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ManagerDetails;