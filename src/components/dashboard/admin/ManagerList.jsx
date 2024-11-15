// src/components/dashboard/admin/ManagerList.jsx
import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { removeManager } from '../../../firebase/adminService';

const ManagerList = ({ managers, onUpdate }) => {
  const handleRemove = async (managerId) => {
    try {
      await removeManager(managerId);
      onUpdate();
    } catch (error) {
      console.error('Error removing manager:', error);
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Restaurant</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {managers.map((manager) => (
          <TableRow key={manager.id}>
            <TableCell>{manager.name}</TableCell>
            <TableCell>{manager.email}</TableCell>
            <TableCell>{manager.restaurantName}</TableCell>
            <TableCell>{manager.location || 'N/A'}</TableCell>
            <TableCell>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleRemove(manager.id)}
              >
                Remove
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ManagerList;