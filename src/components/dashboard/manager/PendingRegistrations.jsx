// src/components/dashboard/manager/PendingRegistrations.jsx
import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { approveEmployee, rejectEmployee } from '../../../firebase/employeeService';

const PendingRegistrations = ({ employees, onUpdate }) => {
  const handleApprove = async (employeeId) => {
    try {
      await approveEmployee(employeeId);
      onUpdate();
    } catch (error) {
      console.error('Error approving employee:', error);
    }
  };

  const handleReject = async (employeeId) => {
    try {
      await rejectEmployee(employeeId);
      onUpdate();
    } catch (error) {
      console.error('Error rejecting employee:', error);
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Registration Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((employee) => (
          <TableRow key={employee.id}>
            <TableCell>{employee.name}</TableCell>
            <TableCell>{employee.email}</TableCell>
            <TableCell>
              {new Date(employee.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleApprove(employee.id)}
                >
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleReject(employee.id)}
                >
                  Reject
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default PendingRegistrations;