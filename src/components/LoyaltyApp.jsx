import React, { useState } from 'react';
import { User, Building, LogOut, Mail, Lock, Coffee, Gift, UserPlus, ChevronDown, MapPin } from 'lucide-react';

const RESTAURANTS = ["Montana's", "Swiss Chalet", "East Side Mario's", "Harvey's", "New York Fries", "The Keg", "Bulgogi House", "Fionn MacCool's", "Kelly's"];

export default function LoyaltyApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [userRole, setUserRole] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [employees, setEmployees] = useState([
    { name: 'John Smith', email: 'john@jlaw.com', restaurant: "Montana's", status: 'Active' },
    { name: 'Jane Doe', email: 'jane@jlaw.com', restaurant: "Swiss Chalet", status: 'Active' }
  ]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginForm.email === "manager@jlaw.com" && loginForm.password === "demo123") {
      setIsAuthenticated(true);
      setUserRole('manager');
    } else if (loginForm.email === "employee@jlaw.com" && loginForm.password === "demo123") {
      setIsAuthenticated(true);
      setUserRole('employee');
    }
  };

  const handleTerminate = (email) => {
    setEmployees(employees.map(emp => 
      emp.email === email ? { ...emp, status: 'Terminated' } : emp
    ));
  };

  if (!isAuthenticated) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <Coffee className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-blue-600">JLaw Enterprise</h1>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full pl-10 p-3 bg-gray-50 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="Password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full pl-10 p-3 bg-gray-50 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>
              <button className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors">
                Sign In
              </button>
            </form>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="font-medium text-blue-900 mb-2">Demo Access:</p>
              <div className="text-sm text-blue-800 space-y-1">
                <p>Manager: manager@jlaw.com</p>
                <p>Employee: employee@jlaw.com</p>
                <p>Password: demo123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
                <button
                  key={restaurant}
                  onClick={() => setSelectedRestaurant(restaurant)}
                  className="w-full p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <Building className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                    <span className="font-medium group-hover:text-blue-600">{restaurant}</span>
                  </div>
                  <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                </button>
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
                {RESTAURANTS.map(r => (
                  <option key={r} value={r}>{r}</option>
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
          <div>
            <h1 className="text-xl font-bold">Employee Dashboard</h1>
            <p className="text-gray-600 text-sm">{selectedRestaurant}</p>
          </div>
          <button onClick={() => setSelectedRestaurant('')} className="text-gray-600 hover:text-gray-800">
            <Building className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">John Smith</h2>
              <p className="text-gray-600">{selectedRestaurant}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg flex justify-between items-center hover:bg-gray-100 transition-colors">
              <span className="font-medium">Meal Allowance</span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Active</span>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg flex justify-between items-center hover:bg-gray-100 transition-colors">
              <span className="font-medium">Employee Discount</span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">20%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}