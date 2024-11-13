import React, { useState, useEffect } from 'react';
import { User, LogOut, Search, Check, X, Building } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Simulated data - replace with your actual data fetching
  const managerRestaurants = ['Montana\'s', 'Swiss Chalet'];
  const activeEmployees = [
    { id: 1, name: 'John Smith', email: 'john@example.com', restaurant: 'Montana\'s', status: 'Active' },
    { id: 2, name: 'Jane Doe', email: 'jane@example.com', restaurant: 'Swiss Chalet', status: 'Active' }
  ];
  const pendingEmployees = [
    { id: 3, name: 'Bob Wilson', email: 'bob@example.com', restaurant: 'Montana\'s', appliedDate: '2024-11-12' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', restaurant: 'Swiss Chalet', appliedDate: '2024-11-13' }
  ];

  const filteredActiveEmployees = activeEmployees.filter(emp => 
    (!selectedRestaurant || emp.restaurant === selectedRestaurant) &&
    (emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     emp.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredPendingEmployees = pendingEmployees.filter(emp =>
    (!selectedRestaurant || emp.restaurant === selectedRestaurant)
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
            <p className="text-gray-600 mt-2 flex items-center gap-2">
              <Building className="w-4 h-4" />
              {managerRestaurants.length === 1 
                ? managerRestaurants[0]
                : 'Multiple Restaurants'
              }
            </p>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <LogOut className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Restaurant Selector - Only show if managing multiple restaurants */}
        {managerRestaurants.length > 1 && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <select
                value={selectedRestaurant}
                onChange={(e) => setSelectedRestaurant(e.target.value)}
                className="w-full p-3 border rounded-lg bg-white"
              >
                <option value="">All Restaurants</option>
                {managerRestaurants.map(restaurant => (
                  <option key={restaurant} value={restaurant}>
                    {restaurant}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'active'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Active Employees
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
              activeTab === 'pending'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Pending Registrations
            {filteredPendingEmployees.length > 0 && (
              <span className="px-2 py-0.5 text-xs bg-blue-500 text-white rounded-full">
                {filteredPendingEmployees.length}
              </span>
            )}
          </button>
        </div>

        {/* Search - Only show for active employees */}
        {activeTab === 'active' && (
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 p-3 bg-white border rounded-lg"
            />
          </div>
        )}

        {/* Content */}
        <Card>
          <CardContent className="pt-6">
            {activeTab === 'active' ? (
              <div className="space-y-4">
                {filteredActiveEmployees.map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{employee.name}</p>
                        <p className="text-sm text-gray-500">{employee.email}</p>
                        <p className="text-xs text-gray-400">{employee.restaurant}</p>
                      </div>
                    </div>
                    <button 
                      className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                      onClick={() => {/* Handle termination */}}
                    >
                      Terminate
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPendingEmployees.map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{employee.name}</p>
                        <p className="text-sm text-gray-500">{employee.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-gray-400">{employee.restaurant}</p>
                          <span className="text-xs text-gray-400">•</span>
                          <p className="text-xs text-gray-400">Applied: {employee.appliedDate}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                        onClick={() => {/* Handle approval */}}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                        onClick={() => {/* Handle rejection */}}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty States */}
            {activeTab === 'active' && filteredActiveEmployees.length === 0 && (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No active employees found</p>
              </div>
            )}
            
            {activeTab === 'pending' && filteredPendingEmployees.length === 0 && (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No pending registrations</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManagerDashboard;