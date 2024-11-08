import React, { useState, useEffect } from 'react';
import { 
  User, 
  Building, 
  Mail, 
  Plus, 
  Edit, 
  Trash, 
  Check,
  X,
  Loader,
  Search,
  ChevronDown 
} from 'lucide-react';
import { 
  createManager, 
  getAllManagers, 
  updateManagerRestaurants,
  deleteManager 
} from '../services/firebaseService';
import { RESTAURANTS } from '../restaurants';

const RestaurantSelector = ({ selectedRestaurants, onChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Get all restaurant options including locations
  const getAllRestaurantOptions = () => {
    return RESTAURANTS.flatMap(restaurant => {
      if (restaurant.locations) {
        return restaurant.locations.map(location => ({
          id: `${restaurant.id}-${location.id}`,
          name: `${restaurant.name} - ${location.name}`,
          parentName: restaurant.name
        }));
      }
      return [{
        id: restaurant.id,
        name: restaurant.name,
        parentName: restaurant.name
      }];
    });
  };

  const allOptions = getAllRestaurantOptions();
  
  const filteredOptions = allOptions.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleOption = (option) => {
    onChange(
      selectedRestaurants.includes(option.id)
        ? selectedRestaurants.filter(id => id !== option.id)
        : [...selectedRestaurants, option.id]
    );
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Assigned Restaurants
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-left flex justify-between items-center"
        >
          <span className="block truncate">
            {selectedRestaurants.length === 0 
              ? 'Select restaurants...'
              : `${selectedRestaurants.length} restaurant(s) selected`}
          </span>
          <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg">
            <div className="p-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm"
                  placeholder="Search restaurants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="max-h-60 overflow-auto">
              {filteredOptions.map((option) => (
                <div
                  key={option.id}
                  className="relative flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleOption(option)}
                >
                  <input
                    type="checkbox"
                    checked={selectedRestaurants.includes(option.id)}
                    onChange={() => {}}
                    className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                  />
                  <div className="ml-3">
                    <span className="block font-medium">{option.name}</span>
                    {option.parentName !== option.name && (
                      <span className="block text-sm text-gray-500">
                        {option.parentName}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddManager, setShowAddManager] = useState(false);
  const [editingManager, setEditingManager] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null);

  // Form state
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    selectedRestaurants: []
  });

  useEffect(() => {
    loadManagers();
  }, []);

  const loadManagers = async () => {
    try {
      const data = await getAllManagers();
      setManagers(data);
    } catch (err) {
      setError('Failed to load managers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createManager({
        ...form,
        restaurants: form.selectedRestaurants
      });
      
      await loadManagers();
      setShowAddManager(false);
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        selectedRestaurants: []
      });
    } catch (err) {
      setError('Failed to create manager');
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurantToggle = (restaurantName) => {
    setForm(prev => ({
      ...prev,
      selectedRestaurants: prev.selectedRestaurants.includes(restaurantName)
        ? prev.selectedRestaurants.filter(r => r !== restaurantName)
        : [...prev.selectedRestaurants, restaurantName]
    }));
  };

  const handleEdit = (manager) => {
    setSelectedManager(manager);
    setForm({
      firstName: manager.firstName,
      lastName: manager.lastName,
      email: manager.email,
      selectedRestaurants: manager.restaurants || []
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await updateManagerRestaurants(selectedManager.id, form.selectedRestaurants);
      await loadManagers();
      setShowEditModal(false);
      setSelectedManager(null);
    } catch (err) {
      setError('Failed to update manager');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (managerId) => {
    if (!window.confirm('Are you sure you want to delete this manager?')) return;
    
    setLoading(true);
    try {
      await deleteManager(managerId);
      await loadManagers();
    } catch (err) {
      setError('Failed to delete manager');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={() => setShowAddManager(true)}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Manager
          </button>
        </div>

        {/* Add Manager Modal */}
        {showAddManager && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Add New Manager</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="First Name"
                      value={form.firstName}
                      onChange={(e) => setForm(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full pl-10 px-4 py-3 rounded-xl bg-white border border-gray-200"
                      required
                    />
                  </div>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={form.lastName}
                      onChange={(e) => setForm(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full pl-10 px-4 py-3 rounded-xl bg-white border border-gray-200"
                      required
                    />
                  </div>
                </div>

                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-10 px-4 py-3 rounded-xl bg-white border border-gray-200"
                    required
                  />
                </div>

                <RestaurantSelector
                  selectedRestaurants={form.selectedRestaurants}
                  onChange={(selected) => setForm(prev => ({
                    ...prev,
                    selectedRestaurants: selected
                  }))}
                />

                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add Manager
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Managers List */}
        <div className="bg-white rounded-2xl shadow">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restaurants</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {managers.map((manager) => (
                  <tr key={manager.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {manager.firstName} {manager.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{manager.email}</td>
                    <td className="px-6 py-4">
                      {manager.restaurants?.length || 0} restaurants
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleEdit(manager)}
                        className="text-indigo-600 hover:text-indigo-900 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(manager.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 