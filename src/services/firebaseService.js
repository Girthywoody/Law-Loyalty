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
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    
    if (!userDoc.exists()) {
      // Check if user is in pending registration
      const pendingDoc = await getDoc(doc(db, 'pendingRegistrations', userCredential.user.uid));
      if (pendingDoc.exists()) {
        throw new Error('Your registration is pending approval.');
      }
      throw new Error('User not found.');
    }

    const userData = userDoc.data();
    if (userData.status === 'terminated') {
      throw new Error('Your account has been terminated. Please contact your manager.');
    }

    return { user: userCredential.user, userData };
  } catch (error) {
    throw error;
  }
};

export const registerEmployee = async (employeeData) => {
  try {
    console.log('Starting registration process for:', employeeData.email);

    // Skip email check as Firebase Auth handles duplicate emails
    
    // Create auth user
    console.log('Creating auth user...');
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      employeeData.email,
      employeeData.password
    ).catch(err => {
      console.error('Error creating auth user:', err);
      if (err.code === 'auth/email-already-in-use') {
        throw new Error('Email already registered.');
      }
      throw err;
    });
    console.log('Auth user created successfully:', userCredential.user.uid);

    // Send verification email
    console.log('Sending verification email...');
    await sendEmailVerification(userCredential.user)
      .catch(err => {
        console.error('Error sending verification:', err);
        throw err;
      });
    console.log('Verification email sent');

    // If registering as admin (temporary)
    if (employeeData.selectedRestaurant === 'ADMIN') {  // Note: changed from restaurant to selectedRestaurant
      console.log('Creating admin user document...');
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        firstName: employeeData.firstName,
        lastName: employeeData.lastName,
        email: employeeData.email,
        role: 'admin',
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }).catch(err => {
        console.error('Error creating admin document:', err);
        throw err;
      });
      console.log('Admin user document created');
    } else {
      // Create pending registration document for regular employees
      console.log('Creating pending registration document...');
      await setDoc(doc(db, 'pendingRegistrations', userCredential.user.uid), {
        uid: userCredential.user.uid,
        firstName: employeeData.firstName,
        lastName: employeeData.lastName,
        email: employeeData.email,
        restaurant: employeeData.selectedRestaurant,
        role: 'employee',
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }).catch(err => {
        console.error('Error creating pending document:', err);
        throw err;
      });
      console.log('Pending registration document created');
    }

    console.log('Registration completed successfully');
    return userCredential.user;
  } catch (error) {
    console.error('Registration failed with error:', error);
    // If there's an error, clean up any created auth user
    if (auth.currentUser) {
      console.log('Cleaning up auth user...');
      await auth.currentUser.delete()
        .catch(err => console.error('Error cleaning up auth user:', err));
    }
    throw error;
  }
};

// Get pending registrations for manager
export const getPendingRegistrations = async (restaurantId) => {
  try {
    const q = query(
      collection(db, 'pendingRegistrations'),
      where('restaurant', '==', restaurantId)
    );
    
    const querySnapshot = await getDocs(q);
    const pendingUsers = [];
    
    querySnapshot.forEach((doc) => {
      pendingUsers.push({ id: doc.id, ...doc.data() });
    });
    
    return pendingUsers;
  } catch (error) {
    throw error;
  }
};

// Approve employee registration
export const approveRegistration = async (userId) => {
  try {
    // Get pending registration data
    const pendingDoc = await getDoc(doc(db, 'pendingRegistrations', userId));
    if (!pendingDoc.exists()) {
      throw new Error('Pending registration not found.');
    }

    const pendingData = pendingDoc.data();

    // Create user document
    await setDoc(doc(db, 'users', userId), {
      ...pendingData,
      status: 'active',
      updatedAt: serverTimestamp()
    });

    // Delete pending registration
    await deleteDoc(doc(db, 'pendingRegistrations', userId));

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
      collection(db, 'users'),
      where('restaurant', '==', restaurantId),
      where('role', '==', 'employee')
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
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'manager')
    );
    
    const querySnapshot = await getDocs(q);
    const managers = [];
    
    querySnapshot.forEach((doc) => {
      const managerData = doc.data();
      // Don't include sensitive data
      delete managerData.password;
      managers.push({ id: doc.id, ...managerData });
    });
    
    return managers;
  } catch (error) {
    throw error;
  }
};

// Create new manager
export const createManager = async (managerData) => {
  try {
    // Check if email is already registered
    const emailQuery = query(
      collection(db, 'users'),
      where('email', '==', managerData.email)
    );
    const emailCheck = await getDocs(emailQuery);
    if (!emailCheck.empty) {
      throw new Error('Email already registered.');
    }

    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      managerData.email,
      // Generate a random temporary password
      Math.random().toString(36).slice(-8)
    );

    // Send password reset email for the manager to set their own password
    await sendPasswordResetEmail(auth, managerData.email);

    // Create user document
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      firstName: managerData.firstName,
      lastName: managerData.lastName,
      email: managerData.email,
      restaurants: managerData.restaurants,
      role: 'manager',
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return userCredential.user;
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