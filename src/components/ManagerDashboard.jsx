import React, { useState, useEffect } from 'react';
import { getPendingEmployees } from '../services/firebaseService';
import PendingEmployees from './PendingEmployees';

const ManagerDashboard = () => {
  const [tabView, setTabView] = useState('active'); // 'active' | 'pending'
  const [pendingEmployees, setPendingEmployees] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState('');

  useEffect(() => {
    const loadPendingEmployees = async () => {
      const pending = await getPendingEmployees(selectedRestaurant);
      setPendingEmployees(pending);
    };

    if (selectedRestaurant) {
      loadPendingEmployees();
    }
  }, [selectedRestaurant]);

  const handleStatusChange = async () => {
    // Reload pending employees after status change
    const pending = await getPendingEmployees(selectedRestaurant);
    setPendingEmployees(pending);
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Add this to your manager view tabs */}
        <div className="flex mb-4">
          <button
            onClick={() => setTabView('active')}
            className={`mr-4 px-4 py-2 rounded-lg ${
              tabView === 'active' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Active Employees
          </button>
          <button
            onClick={() => setTabView('pending')}
            className={`px-4 py-2 rounded-lg ${
              tabView === 'pending' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Pending ({pendingEmployees.length})
          </button>
        </div>

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

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {tabView === 'active' ? (
            // Your existing active employees list
            <div>
              {/* ... */}
            </div>
          ) : (
            <PendingEmployees
              pendingEmployees={pendingEmployees}
              onStatusChange={handleStatusChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard; 