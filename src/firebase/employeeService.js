// src/firebase/employeeService.js
import { 
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp
  } from 'firebase/firestore';
  import { app } from './config';
  
  const db = getFirestore(app);
  
  export const getEmployeesByRestaurant = async (restaurantId) => {
    try {
      const employeesQuery = query(
        collection(db, 'users'),
        where('restaurantId', '==', restaurantId),
        where('role', '==', 'employee')
      );
  
      const snapshot = await getDocs(employeesQuery);
      const employees = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
  
      return {
        active: employees.filter(emp => emp.status === 'active'),
        pending: employees.filter(emp => emp.status === 'pending')
      };
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  };
  
  export const updateEmployee = async (employeeId, updateData) => {
    try {
      await updateDoc(doc(db, 'users', employeeId), {
        ...updateData,
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  };
  
  export const deactivateEmployee = async (employeeId) => {
    try {
      await updateDoc(doc(db, 'users', employeeId), {
        status: 'inactive',
        deactivatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error deactivating employee:', error);
      throw error;
    }
  };
  
  export const approveEmployee = async (employeeId) => {
    try {
      await updateDoc(doc(db, 'users', employeeId), {
        status: 'active',
        approvedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error approving employee:', error);
      throw error;
    }
  };
  
  export const rejectEmployee = async (employeeId) => {
    try {
      await deleteDoc(doc(db, 'users', employeeId));
    } catch (error) {
      console.error('Error rejecting employee:', error);
      throw error;
    }
  };
  
  export const recordVisit = async (employeeId, restaurantId, locationId = null) => {
    try {
      const visitRef = await addDoc(collection(db, 'visits'), {
        employeeId,
        restaurantId,
        locationId,
        timestamp: serverTimestamp()
      });
  
      await updateDoc(doc(db, 'users', employeeId), {
        lastVisit: serverTimestamp()
      });
  
      return visitRef.id;
    } catch (error) {
      console.error('Error recording visit:', error);
      throw error;
    }
  };