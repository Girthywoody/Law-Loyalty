import React, { useState, useEffect } from 'react';
import { User, Building, LogOut, UserPlus, Search, X } from 'lucide-react';
import { getPendingEmployees } from '../services/firebaseService';
import PendingEmployees from './PendingEmployees';

const ManagerDashboard = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState([
    { id: 1, firstName: 'John', lastName: 'Smith', email: 'john@jlaw.com', restaurant: "Montana's", status: 'Active' },
    { id: 2, firstName: 'Jane', lastName: 'Doe', email: 'jane@jlaw.com', restaurant: "Swiss Chalet", status: 'Active' },
    { id: 3, firstName: 'Mike', lastName: 'Johnson', email: 'mike@jlaw.com', restaurant: "Kelsey's", status: 'Active' },
    { id: 4, firstName: 'Sarah', lastName: 'Wilson', email: 'sarah@jlaw.com', restaurant: "Cora's Breakfast", status: 'Terminated' }
  ]);
  const [newEmployee, setNewEmployee] = useState({
    firstName: '',
    lastName: '',
    email: '',
    restaurant: ''
  });
  const [tabView, setTabView] = useState('active');
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

  const restaurants = [
    "Montana's",
    "Kelsey's",
    "Cora's Breakfast",
    "Swiss Chalet",
    "Overtime Bar",
    "Lot 88 Steakhouse",
    "Poke Bar",
    "Happy Life"
  ];

  const handleTerminate = (id) => {
    setEmployees(employees.map(emp => 
      emp.id === id ? { ...emp, status: 'Terminated' } : emp
    ));
  };

  const handleReactivate = (id) => {
    setEmployees(employees.map(emp => 
      emp.id === id ? { ...emp, status: 'Active' } : emp
    ));
  };

  const handleAddEmployee = (e) => {
    e.preventDefault();
    const id = employees.length + 1;
    setEmployees([...employees, { ...newEmployee, id, status: 'Active' }]);
    setNewEmployee({ firstName: '', lastName: '', email: '', restaurant: '' });
    setShowAddModal(false);
  };

  const filteredEmployees = employees.filter(emp => 
    emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.restaurant.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
            <p className="text-gray-600 mt-1">Manage your restaurant staff</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Add Employee
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
        {tabView === 'active' ? (
          // Existing employee list content
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="min-w-full divide-y divide-gray-200">
              <div className="bg-gray-50 px-6 py-3">
                <div className="grid grid-cols-5 gap-4">
                  <div className="text-left text-xs font-medium text-gray-500 uppercase">Employee</div>
                  <div className="text-left text-xs font-medium text-gray-500 uppercase">Email</div>
                  <div className="text-left text-xs font-medium text-gray-500 uppercase">Restaurant</div>
                  <div className="text-left text-xs font-medium text-gray-500 uppercase">Status</div>
                  <div className="text-right text-xs font-medium text-gray-500 uppercase">Actions</div>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredEmployees.map((employee) => (
                  <div key={employee.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="grid grid-cols-5 gap-4 items-center">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {employee.firstName} {employee.lastName}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-900">{employee.email}</div>
                      <div className="text-sm text-gray-900">{employee.restaurant}</div>
                      <div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          employee.status === 'Active' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {employee.status}
                        </span>
                      </div>
                      <div className="text-right">
                        {employee.status === 'Active' ? (
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
          </div>
        ) : (
          <PendingEmployees
            pendingEmployees={pendingEmployees}
            onStatusChange={handleStatusChange}
          />
        )}

        {/* Add Employee Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Add New Employee</h2>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddEmployee} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={newEmployee.firstName}
                    onChange={(e) => setNewEmployee({...newEmployee, firstName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={newEmployee.lastName}
                    onChange={(e) => setNewEmployee({...newEmployee, lastName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant</label>
                  <select
                    required
                    value={newEmployee.restaurant}
                    onChange={(e) => setNewEmployee({...newEmployee, restaurant: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Restaurant</option>
                    {restaurants.map((restaurant) => (
                      <option key={restaurant} value={restaurant}>
                        {restaurant}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Employee
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;