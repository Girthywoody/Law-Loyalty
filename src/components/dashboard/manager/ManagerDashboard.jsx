// src/components/dashboard/manager/ManagerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import ActiveEmployees from './ActiveEmployees';
import PendingRegistrations from './PendingRegistrations';
import { getEmployeesByRestaurant } from '../../../firebase/employeeService';

const ManagerDashboard = ({ userData }) => {
  const [activeEmployees, setActiveEmployees] = useState([]);
  const [pendingEmployees, setPendingEmployees] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (userData?.restaurantId) {
      fetchEmployees();
    }
  }, [userData]);

  const fetchEmployees = async () => {
    try {
      const { active, pending } = await getEmployeesByRestaurant(userData.restaurantId);
      setActiveEmployees(active);
      setPendingEmployees(pending);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Card className="max-w-6xl mx-auto">
        <CardHeader className="border-b">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Manager Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">{userData?.restaurantName}</span>
              <button
                onClick={() => navigate('/logout')}
                className="text-gray-600 hover:text-gray-800"
              >
                Sign Out
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <Tabs defaultValue="active" className="space-y-4">
            <TabsList>
              <TabsTrigger value="active">
                Active Employees ({activeEmployees.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending Registrations ({pendingEmployees.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              <ActiveEmployees 
                employees={activeEmployees}
                onUpdate={fetchEmployees}
              />
            </TabsContent>

            <TabsContent value="pending">
              <PendingRegistrations
                employees={pendingEmployees}
                onUpdate={fetchEmployees}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerDashboard;



