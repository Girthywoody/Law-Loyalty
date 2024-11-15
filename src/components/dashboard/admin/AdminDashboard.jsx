// src/components/dashboard/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ManagerList from './ManagerList';
import AddManager from './AddManager';
import { getManagers } from '../../../firebase/adminService';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [managers, setManagers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      const managersData = await getManagers();
      setManagers(managersData);
    } catch (error) {
      console.error('Error fetching managers:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Card className="max-w-6xl mx-auto">
        <CardHeader className="border-b">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <button
              onClick={() => navigate('/logout')}
              className="text-gray-600 hover:text-gray-800"
            >
              Sign Out
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <Tabs defaultValue="managers" className="space-y-4">
            <TabsList>
              <TabsTrigger value="managers">Managers</TabsTrigger>
              <TabsTrigger value="add">Add Manager</TabsTrigger>
            </TabsList>

            <TabsContent value="managers">
              <ManagerList managers={managers} onUpdate={fetchManagers} />
            </TabsContent>

            <TabsContent value="add">
              <AddManager onManagerAdded={fetchManagers} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;


