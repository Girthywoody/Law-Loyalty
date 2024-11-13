import React, { useState, useEffect } from 'react';
import { User, Building, LogOut, Coffee, Gift, UserPlus, ChevronDown, MapPin, Clock, Calendar } from 'lucide-react';
import LoginPage from './LoginPage';
import AdminDashboard from './AdminDashboard';
import { RESTAURANTS } from './restaurants';

export default function LoyaltyApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [employees, setEmployees] = useState([
    { name: 'John Smith', email: 'john@jlaw.com', restaurant: "Montana's", status: 'Active' },
    { name: 'Jane Doe', email: 'jane@jlaw.com', restaurant: "Swiss Chalet", status: 'Active' }
  ]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = (authenticated, role) => {
    setIsAuthenticated(authenticated);
    setUserRole(role);
  };

  const handleTerminate = (email) => {
    setEmployees(employees.map(emp => 
      emp.email === email ? { ...emp, status: 'Terminated' } : emp
    ));
  };

  const getEmployeeDiscount = (restaurantName) => {
    const restaurant = RESTAURANTS.find(r => 
      restaurantName.startsWith(r.name)
    );
    return restaurant?.discount || "20%";
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (userRole === 'admin') {
    return <AdminDashboard />;
  }

  if (userRole === 'employee' && !selectedRestaurant) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <MapPin className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-blue-600 mb-2">Select Your Location</h1>
            <p className="text-gray-600">Choose your restaurant to continue</p>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <div className="space-y-4">
              {RESTAURANTS.map((restaurant) => (
                <div key={restaurant.name}>
                  <button
                    onClick={() => {
                      if (restaurant.locations) {
                        setOpenDropdown(openDropdown === restaurant.name ? null : restaurant.name);
                      } else {
                        setSelectedRestaurant(restaurant.name);
                      }
                    }}
                    className="w-full p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <Building className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                      <div className="text-left">
                        <span className="font-medium group-hover:text-blue-600">
                          {restaurant.name}
                        </span>
                        {restaurant.discount && (
                          <span className="ml-2 text-sm text-blue-600">
                            ({restaurant.discount})
                          </span>
                        )}
                      </div>
                    </div>
                    {restaurant.locations && (
                      <ChevronDown 
                        className={`w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-transform duration-200 ${
                          openDropdown === restaurant.name ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </button>
                  
                  {/* Locations Dropdown - Only show when this restaurant is selected */}
                  {restaurant.locations && openDropdown === restaurant.name && (
                    <div className="mt-2 ml-8 space-y-2 animate-fadeIn">
                      {restaurant.locations.map((location) => (
                        <button
                          key={location}
                          onClick={() => {
                            setSelectedLocation(location);
                            setSelectedRestaurant(`${restaurant.name} - ${location}`);
                          }}
                          className="w-full p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
                        >
                          <MapPin className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-blue-700">{location}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={() => setIsAuthenticated(false)}
            className="mt-6 text-gray-600 hover:text-gray-800 transition-colors mx-auto block"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  if (userRole === 'manager') {
    return (
      <div className="w-full min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold">Manager Dashboard</h1>
            <button onClick={() => setIsAuthenticated(false)} className="text-gray-600 hover:text-gray-800">
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex justify-between mb-6">
              <select
                value={selectedRestaurant}
                onChange={(e) => setSelectedRestaurant(e.target.value)}
                className="p-2 border rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="">All Restaurants</option>
                {RESTAURANTS.map(restaurant => (
                  <option key={restaurant.name} value={restaurant.name}>
                    {restaurant.name}
                  </option>
                ))}
              </select>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <UserPlus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {employees
                .filter(emp => !selectedRestaurant || emp.restaurant === selectedRestaurant)
                .map((emp, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="font-medium">{emp.name}</p>
                      <p className="text-sm text-gray-600">{emp.restaurant}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        emp.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {emp.status}
                      </span>
                      {emp.status === 'Active' && (
                        <button 
                          onClick={() => handleTerminate(emp.email)}
                          className="text-red-600 hover:text-red-700 transition-colors"
                        >
                          Terminate
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Building className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-medium text-gray-900">{selectedRestaurant}</h2>
          </div>
          <button 
            onClick={() => setIsAuthenticated(false)} 
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">John Smith</h2>
              <p className="text-gray-600">{selectedRestaurant}</p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="text-xl font-semibold text-blue-800">
                {currentTime.toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800">
                {currentTime.toLocaleDateString(undefined, { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl flex justify-between items-center">
              <span className="font-medium text-gray-900">Employee Discount</span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                {getEmployeeDiscount(selectedRestaurant)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Company Policy</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis 
            nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
        </div>
      </div>
    </div>
  );
}