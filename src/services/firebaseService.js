import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc,
  getDocs,
  collection,
  query,
  where,
  updateDoc,
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';


// User Authentication
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Extract first and last name from email (before the @)
    const emailPrefix = email.split('@')[0];
    const docId = emailPrefix.toLowerCase(); // This should match how you created the admin document
    
    // First check managers collection
    const managerDoc = await getDoc(doc(db, 'managers', docId));
    
    if (managerDoc.exists()) {
      const userData = { id: docId, ...managerDoc.data() };
      return { user: userCredential.user, userData, collection: 'managers' };
    }

    // Then check employees collection
    const employeeDoc = await getDoc(doc(db, 'employees', docId));
    
    if (employeeDoc.exists()) {
      const userData = { id: docId, ...employeeDoc.data() };
      return { user: userCredential.user, userData, collection: 'employees' };
    }

    throw new Error('User not found');
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const registerEmployee = async (employeeData) => {
  try {
    // Create docId from email prefix (before the @)
    const emailPrefix = employeeData.email.split('@')[0];
    const docId = emailPrefix.toLowerCase();
    
    // If registering as admin, create directly in managers collection
    if (employeeData.role === 'admin') {
      // Create user document first
      await setDoc(doc(db, 'managers', docId), {
        firstName: employeeData.firstName,
        lastName: employeeData.lastName,
        email: employeeData.email,
        role: 'admin',
        status: 'active',
        restaurants: 'all',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Send password setup email
      await sendPasswordResetEmail(auth, employeeData.email);
      
      // Show success message
      alert('Admin account created successfully. Please check your email to set up your password.');
    } else {
      // Regular employee registration process
      await setDoc(doc(db, 'pendingRegistrations', docId), {
        firstName: employeeData.firstName,
        lastName: employeeData.lastName,
        email: employeeData.email,
        restaurant: employeeData.selectedRestaurant,
        role: 'employee',
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    return docId;
  } catch (error) {
    console.error('Error registering:', error);
    throw error;
  }
};

// Get pending registrations for manager
export const getPendingRegistrations = async (restaurantIds) => {
  try {
    // Handle both single restaurant ID and array of IDs
    const restaurantArray = Array.isArray(restaurantIds) ? restaurantIds : [restaurantIds];
    
    const q = query(
      collection(db, 'pendingRegistrations'),
      where('restaurant', 'in', restaurantArray)
    );
    
    const querySnapshot = await getDocs(q);
    const pendingUsers = [];
    
    querySnapshot.forEach((doc) => {
      pendingUsers.push({ 
        id: doc.id,
        ...doc.data() 
      });
    });
    
    return pendingUsers;
  } catch (error) {
    throw error;
  }
};

// Approve employee registration
export const approveRegistration = async (employeeId) => {
  try {
    // Get pending registration data
    const pendingDoc = await getDoc(doc(db, 'pendingRegistrations', employeeId));
    if (!pendingDoc.exists()) {
      throw new Error('Pending registration not found.');
    }

    const pendingData = pendingDoc.data();

    // Create employee document
    await setDoc(doc(db, 'employees', employeeId), {
      ...pendingData,
      status: 'active',
      updatedAt: serverTimestamp()
    });

    // Delete pending registration
    await deleteDoc(doc(db, 'pendingRegistrations', employeeId));

    return true;
  } catch (error) {
    throw error;
  }
};

// Reject employee registration
export const rejectRegistration = async (userId) => {
  try {
    // Delete pending registration
    await deleteDoc(doc(db, 'pendingRegistrations', userId));
    return true;
  } catch (error) {
    throw error;
  }
};

// Update employee status
export const updateEmployeeStatus = async (userId, status) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      status: status,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    throw error;
  }
};

// Password reset
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    throw error;
  }
};

// Get employees for multiple restaurants
export const getEmployees = async (restaurantId) => {
  try {
    const q = query(
      collection(db, 'employees'),
      where('restaurant', '==', restaurantId)
    );
    
    const querySnapshot = await getDocs(q);
    const employees = [];
    
    querySnapshot.forEach((doc) => {
      employees.push({ id: doc.id, ...doc.data() });
    });
    
    return employees;
  } catch (error) {
    throw error;
  }
};

// Get all managers
export const getAllManagers = async () => {
  try {
    const managersSnapshot = await getDocs(collection(db, 'managers'));
    const managers = [];
    
    managersSnapshot.forEach((doc) => {
      managers.push({ 
        id: doc.id,  // This will now be firstName-lastName
        ...doc.data() 
      });
    });
    
    return managers;
  } catch (error) {
    throw error;
  }
};

// Create new manager
export const createManager = async (managerData) => {
  try {
    const docId = `${managerData.firstName.toLowerCase()}-${managerData.lastName.toLowerCase()}`;
    
    // Create user document
    await setDoc(doc(db, 'managers', docId), {
      firstName: managerData.firstName,
      lastName: managerData.lastName,
      email: managerData.email,
      restaurants: managerData.restaurants,
      role: 'manager',
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return docId;
  } catch (error) {
    throw error;
  }
};

// Update manager's restaurants
export const updateManagerRestaurants = async (managerId, restaurants) => {
  try {
    await updateDoc(doc(db, 'users', managerId), {
      restaurants: restaurants,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    throw error;
  }
};

// Delete manager
export const deleteManager = async (managerId) => {
  try {
    await deleteDoc(doc(db, 'users', managerId));
    return true;
  } catch (error) {
    throw error;
  }
};