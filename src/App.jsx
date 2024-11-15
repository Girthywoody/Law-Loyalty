// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Register from './components/auth/Register';
import AdminDashboard from './components/dashboard/admin/AdminDashboard';
import ManagerDashboard from './components/dashboard/manager/ManagerDashboard';
import EmployeeDashboard from '../components/dashboard/EmployeeDashboard';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" />;
  }

  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Routes>
                  <Route index element={<AdminDashboard />} />
                  <Route path="managers" element={<AdminDashboard />} />
                  <Route path="restaurants" element={<RestaurantOverview />} />
                  <Route path="activity" element={<ActivityLog />} />
                </Routes>
              </ProtectedRoute>
            }
          />

          {/* Protected Manager Routes */}
          <Route
            path="/manager/*"
            element={
              <ProtectedRoute allowedRoles={['manager']}>
                <Routes>
                  <Route index element={<ManagerDashboard />} />
                  <Route path="employees" element={<ManagerDashboard />} />
                </Routes>
              </ProtectedRoute>
            }
          />

          {/* Protected Employee Routes */}
          <Route
            path="/employee"
            element={
              <ProtectedRoute allowedRoles={['employee']}>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;

