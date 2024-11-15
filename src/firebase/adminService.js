// src/firebase/adminService.js
import { 
    getFirestore, 
    collection, 
    query, 
    where, 
    getDocs, 
    doc, 
    setDoc, 
    deleteDoc, 
    updateDoc,
    serverTimestamp 
  } from 'firebase/firestore';
  import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    sendPasswordResetEmail 
  } from 'firebase/auth';
  import { app } from './config';
  
  const db = getFirestore(app);
  const auth = getAuth(app);
  
  // Get all managers
  export const getManagers = async () => {
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'manager'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching managers:', error);
      throw error;
    }
  };
  
  // Add a new manager
  export const addManager = async (managerData) => {
    try {
      // Generate a temporary password
      const tempPassword = Math.random().toString(36).slice(-8);
  
      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        managerData.email,
        tempPassword
      );
  
      // Send password reset email
      await sendPasswordResetEmail(auth, managerData.email);
  
      // Create manager document
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name: managerData.name,
        email: managerData.email,
        role: 'manager',
        restaurantId: managerData.restaurantId,
        restaurantName: managerData.restaurantName,
        locationId: managerData.locationId || null,
        createdAt: serverTimestamp(),
        lastLogin: null,
        status: 'active'
      });
  
      // Create activity log
      await addActivityLog({
        type: 'MANAGER_ADDED',
        managerEmail: managerData.email,
        restaurantId: managerData.restaurantId,
        createdBy: auth.currentUser.uid
      });
  
      return userCredential.user.uid;
    } catch (error) {
      console.error('Error adding manager:', error);
      throw error;
    }
  };
  
  // Remove a manager
  export const removeManager = async (managerId) => {
    try {
      // Get manager data first for logging
      const managerDoc = await doc(db, 'users', managerId).get();
      const managerData = managerDoc.data();
  
      // Delete user document
      await deleteDoc(doc(db, 'users', managerId));
      
      // Update any associated restaurants
      const restaurantsRef = collection(db, 'restaurants');
      const q = query(restaurantsRef, where('managerId', '==', managerId));
      const snapshot = await getDocs(q);
      
      const updatePromises = snapshot.docs.map(doc => 
        updateDoc(doc.ref, { 
          managerId: null,
          lastUpdated: serverTimestamp()
        })
      );
      
      await Promise.all(updatePromises);
  
      // Create activity log
      await addActivityLog({
        type: 'MANAGER_REMOVED',
        managerEmail: managerData.email,
        restaurantId: managerData.restaurantId,
        removedBy: auth.currentUser.uid
      });
    } catch (error) {
      console.error('Error removing manager:', error);
      throw error;
    }
  };
  
  // Update manager details
  export const updateManager = async (managerId, updateData) => {
    try {
      await updateDoc(doc(db, 'users', managerId), {
        ...updateData,
        lastUpdated: serverTimestamp()
      });
  
      // Create activity log
      await addActivityLog({
        type: 'MANAGER_UPDATED',
        managerId,
        updatedFields: Object.keys(updateData),
        updatedBy: auth.currentUser.uid
      });
    } catch (error) {
      console.error('Error updating manager:', error);
      throw error;
    }
  };
  
  // Get restaurant statistics
  export const getRestaurantStats = async () => {
    try {
      const restaurantsRef = collection(db, 'restaurants');
      const snapshot = await getDocs(restaurantsRef);
      
      const stats = await Promise.all(snapshot.docs.map(async doc => {
        const restaurantData = doc.data();
        
        // Get employee count
        const employeesQuery = query(
          collection(db, 'users'),
          where('restaurantId', '==', doc.id),
          where('role', '==', 'employee')
        );
        const employeesSnapshot = await getDocs(employeesQuery);
        
        // Get visit count for last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const visitsQuery = query(
          collection(db, 'visits'),
          where('restaurantId', '==', doc.id),
          where('timestamp', '>=', thirtyDaysAgo)
        );
        const visitsSnapshot = await getDocs(visitsQuery);
        
        return {
          id: doc.id,
          name: restaurantData.name,
          employees: employeesSnapshot.size,
          activeVisits: visitsSnapshot.size,
          location: restaurantData.location || 'Main'
        };
      }));
      
      return stats;
    } catch (error) {
      console.error('Error getting restaurant stats:', error);
      throw error;
    }
  };
  
  // Add activity log
  const addActivityLog = async (logData) => {
    try {
      await addDoc(collection(db, 'activityLogs'), {
        ...logData,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding activity log:', error);
      // Don't throw error for logging failures
    }
  };
  
  // Get activity logs
  export const getActivityLog = async (limit = 50) => {
    try {
      const q = query(
        collection(db, 'activityLogs'),
        orderBy('timestamp', 'desc'),
        limit(limit)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      throw error;
    }
  };