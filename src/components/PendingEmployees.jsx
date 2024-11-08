import React, { useState } from 'react';
import { User, Mail, Building, Check, X, Loader } from 'lucide-react';
import { approveEmployee, rejectEmployee } from '../services/firebaseService';

const PendingEmployeeCard = ({ employee, onStatusChange }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleApprove = async () => {
    setLoading(true);
    setError('');
    try {
      await approveEmployee(employee.id);
      onStatusChange();
    } catch (err) {
      setError('Failed to approve employee');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (window.confirm('Are you sure you want to reject this application?')) {
      setLoading(true);
      setError('');
      try {
        await rejectEmployee(employee.id);
        onStatusChange();
      } catch (err) {
        setError('Failed to reject employee');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-violet-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">
              {employee.firstName} {employee.lastName}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-4 h-4" />
              {employee.email}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
              <Building className="w-4 h-4" />
              {employee.restaurant}
            </div>
          </div>
        </div>

        {!loading ? (
          <div className="flex gap-2">
            <button
              onClick={handleApprove}
              className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
              title="Approve"
            >
              <Check className="w-5 h-5" />
            </button>
            <button
              onClick={handleReject}
              className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
              title="Reject"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="p-2">
            <Loader className="w-5 h-5 text-violet-600 animate-spin" />
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
};

const PendingEmployees = ({ pendingEmployees, onStatusChange }) => {
  if (pendingEmployees.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-gray-500 font-medium">No pending applications</h3>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pendingEmployees.map((employee) => (
        <PendingEmployeeCard
          key={employee.id}
          employee={employee}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
};

export default PendingEmployees; 