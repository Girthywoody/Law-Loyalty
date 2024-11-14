import { 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { 
  doc, 
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';

// User roles enum
export const UserRoles = {
  MANAGER: 'manager',
  EMPLOYEE: 'employee'
};

// User status enum
export const UserStatus = {
  PENDING: 'pending',
  ACTIVE: 'active',
  TERMINATED: 'terminated'
};

export class AuthService {
  // Manager Management
  static async createManager(managerData) {
    try {
      const { email, firstName, lastName, restaurants } = managerData;
      
      // Create document ID from name
      const docId = `${firstName.toLowerCase()}-${lastName.toLowerCase()}`;
      
      // Create manager document
      await setDoc(doc(db, 'managers', docId), {
        email,
        firstName,
        lastName,
        restaurants, // Array of restaurant IDs they can manage
        role: UserRoles.MANAGER,
        status: UserStatus.PENDING,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Send password setup email
      await sendPasswordResetEmail(auth, email);

      return docId;
    } catch (error) {
      console.error('Error creating manager:', error);
      throw error;
    }
  }

  static async updateManagerRestaurants(managerId, restaurants) {
    try {
      await updateDoc(doc(db, 'managers', managerId), {
        restaurants,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating manager restaurants:', error);
      throw error;
    }
  }

  static async deleteManager(managerId) {
    try {
      await deleteDoc(doc(db, 'managers', managerId));
      return true;
    } catch (error) {
      console.error('Error deleting manager:', error);
      throw error;
    }
  }

  // Employee Management
  static async registerEmployee(employeeData) {
    try {
      const { email, firstName, lastName, restaurant } = employeeData;
      
      // Create document ID from name
      const docId = `${firstName.toLowerCase()}-${lastName.toLowerCase()}`;
      
      // Create pending registration document
      await setDoc(doc(db, 'pendingRegistrations', docId), {
        email,
        firstName,
        lastName,
        restaurant,
        role: UserRoles.EMPLOYEE,
        status: UserStatus.PENDING,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return docId;
    } catch (error) {
      console.error('Error registering employee:', error);
      throw error;
    }
  }

  static async approveEmployee(employeeId) {
    try {
      // Get pending registration data
      const pendingDoc = await getDoc(doc(db, 'pendingRegistrations', employeeId));
      if (!pendingDoc.exists()) {
        throw new Error('Pending registration not found');
      }

      const employeeData = pendingDoc.data();

      // Create employee document
      await setDoc(doc(db, 'employees', employeeId), {
        ...employeeData,
        status: UserStatus.ACTIVE,
        updatedAt: serverTimestamp()
      });

      // Send password setup email
      await sendPasswordResetEmail(auth, employeeData.email);

      // Delete pending registration
      await deleteDoc(doc(db, 'pendingRegistrations', employeeId));

      return true;
    } catch (error) {
      console.error('Error approving employee:', error);
      throw error;
    }
  }

  static async rejectEmployee(employeeId) {
    try {
      await deleteDoc(doc(db, 'pendingRegistrations', employeeId));
      return true;
    } catch (error) {
      console.error('Error rejecting employee:', error);
      throw error;
    }
  }

  static async terminateEmployee(employeeId) {
    try {
      await updateDoc(doc(db, 'employees', employeeId), {
        status: UserStatus.TERMINATED,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error terminating employee:', error);
      throw error;
    }
  }

  // Authentication
  static async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check user collections in order of hierarchy
      const collections = ['managers', 'employees'];
      let userData = null;
      let userCollection = null;

      for (const collectionName of collections) {
        const q = query(
          collection(db, collectionName),
          where('email', '==', email)
        );
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          userData = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
          userCollection = collectionName;
          break;
        }
      }

      if (!userData) {
        throw new Error('User not found');
      }

      if (userData.status === UserStatus.TERMINATED) {
        throw new Error('Account has been terminated');
      }

      return { user: userCredential.user, userData, collection: userCollection };
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }

  static async logout() {
    try {
      await signOut(auth);
      return true;
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }

  // Helper methods
  static async getManagerRestaurants(managerId) {
    try {
      const managerDoc = await getDoc(doc(db, 'managers', managerId));
      if (!managerDoc.exists()) {
        throw new Error('Manager not found');
      }
      return managerDoc.data().restaurants || [];
    } catch (error) {
      console.error('Error getting manager restaurants:', error);
      throw error;
    }
  }

  static async getPendingRegistrations(restaurantIds) {
    try {
      const q = query(
        collection(db, 'pendingRegistrations'),
        where('restaurant', 'in', restaurantIds)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting pending registrations:', error);
      throw error;
    }
  }
}