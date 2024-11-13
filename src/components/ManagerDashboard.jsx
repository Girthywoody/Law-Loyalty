import React, { useState, useEffect } from 'react';
import { User, LogOut, UserPlus, Search, X, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  getEmployees,
  getPendingRegistrations,
  approveRegistration,
  rejectRegistration,
  updateEmployeeStatus
} from '../services/firebaseService';

const ManagerDashboard = () => {
  const { currentUser, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState([]);
  const [pendingEmployees, setPendingEmployees] = useState([]);
  const [tabView, setTabView] = useState('active');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Get the restaurants this manager is authorized to manage
  const getAuthorizedRestaurants = () => {
    if (!currentUser?.restaurants) return [];
    return currentUser.restaurants;
  };

  // Filter employees to only show those from authorized restaurants
  const getEmployees = async () => {
    try {
      setLoading(true);
      const authorizedRestaurants = getAuthorizedRestaurants();
      const [employeesData, pendingData] = await Promise.all([
        Promise.all(authorizedRestaurants.map(restaurantId => 
          getEmployees(restaurantId)
        )),
        Promise.all(authorizedRestaurants.map(restaurantId => 
          getPendingRegistrations(restaurantId)
        ))
      ]);

      // Flatten the arrays of employees and pending registrations
      setEmployees(employeesData.flat());
      setPendingEmployees(pendingData.flat());
    } catch (error) {
      setError('Failed to load data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser?.restaurants?.length) {
      setError('No restaurants assigned');
      setLoading(false);
      return;
    }
    getEmployees();
  }, [currentUser]);

  const handleApprove = async (userId) => {
    try {
      await approveRegistration(userId);
      await getEmployees(); // Refresh data
    } catch (error) {
      setError('Failed to approve registration');
      console.error(error);
    }
  };

  const handleReject = async (userId) => {
    try {
      await rejectRegistration(userId);
      await getEmployees(); // Refresh data
    } catch (error) {
      setError('Failed to reject registration');
      console.error(error);
    }
  };

  const handleTerminate = async (userId) => {
    try {
      await updateEmployeeStatus(userId, 'terminated');
      await getEmployees(); // Refresh data
    } catch (error) {
      setError('Failed to terminate employee');
      console.error(error);
    }
  };

  const handleReactivate = async (userId) => {
    try {
      await updateEmployeeStatus(userId, 'active');
      await getEmployees(); // Refresh data
    } catch (error) {
      setError('Failed to reactivate employee');
      console.error(error);
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
            <p className="text-gray-600 mt-1">
              {currentUser?.restaurants.length > 0 ? currentUser.restaurants.map(restaurant => restaurant.name).join(', ') : 'Unknown Restaurant'}
            </p>
          </div>
          <button 
            onClick={logout}
            className="text-gray-600 hover:text-gray-800"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setTabView('active')}
              className={`px-6 py-3 font-medium text-sm ${
                tabView === 'active'
                  ? 'border-b-2 border-violet-600 text-violet-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Active Employees
            </button>
            <button
              onClick={() => setTabView('pending')}
              className={`px-6 py-3 font-medium text-sm flex items-center gap-2 ${
                tabView === 'pending'
                  ? 'border-b-2 border-violet-600 text-violet-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Pending Applications
              {pendingEmployees.length > 0 && (
                <span className="px-2 py-1 bg-violet-100 text-violet-600 rounded-full text-xs">
                  {pendingEmployees.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 px-4 py-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Content */}
        {tabView === 'active' ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="min-w-full divide-y divide-gray-200">
              {filteredEmployees.map((employee) => (
                <div key={employee.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-violet-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-violet-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {employee.firstName} {employee.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{employee.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
employee.status === 'active' 
? 'bg-green-100 text-green-800'
: 'bg-red-100 text-red-800'
}`}>
{employee.status}
</span>
{employee.status === 'active' ? (
<button
onClick={() => handleTerminate(employee.id)}
className="text-red-600 hover:text-red-900 text-sm font-medium"
>
Terminate
</button>
) : (
<button
onClick={() => handleReactivate(employee.id)}
className="text-green-600 hover:text-green-900 text-sm font-medium"
>
Reactivate
</button>
)}
</div>
</div>
</div>
))}
</div>
</div>
) : (
// Pending Applications View
<div className="bg-white rounded-xl shadow-lg overflow-hidden">
<div className="min-w-full divide-y divide-gray-200">
{pendingEmployees.length === 0 ? (
<div className="p-8 text-center text-gray-500">
No pending applications
</div>
) : (
pendingEmployees.map((employee) => (
<div key={employee.id} className="p-4 hover:bg-gray-50">
<div className="flex items-center justify-between">
<div className="flex items-center">
<div className="h-10 w-10 flex-shrink-0 bg-violet-100 rounded-full flex items-center justify-center">
<User className="h-5 w-5 text-violet-600" />
</div>
<div className="ml-4">
<div className="text-sm font-medium text-gray-900">
  {employee.firstName} {employee.lastName}
</div>
<div className="text-sm text-gray-500">{employee.email}</div>
<div className="text-xs text-gray-400 mt-1">
  Applied: {new Date(employee.createdAt?.toDate()).toLocaleDateString()}
</div>
</div>
</div>
<div className="flex items-center gap-2">
<button
onClick={() => handleApprove(employee.id)}
className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium hover:bg-green-200"
>
<Check className="w-4 h-4 mr-1" />
Approve
</button>
<button
onClick={() => handleReject(employee.id)}
className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium hover:bg-red-200"
>
<X className="w-4 h-4 mr-1" />
Reject
</button>
</div>
</div>
</div>
))
)}
</div>
</div>
)}
</div>
</div>
);
};

export default ManagerDashboard;