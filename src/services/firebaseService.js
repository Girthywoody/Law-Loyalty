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

// Register new employee
export const registerEmployee = async (employeeData) => {
  try {
    // Check if email is already registered
    const emailQuery = query(
      collection(db, 'users'),
      where('email', '==', employeeData.email)
    );
    const emailCheck = await getDocs(emailQuery);
    if (!emailCheck.empty) {
      throw new Error('Email already registered.');
    }

    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      employeeData.email,
      employeeData.password
    );

    // Send verification email
    await sendEmailVerification(userCredential.user);

    // Create pending registration document
    await setDoc(doc(db, 'pendingRegistrations', userCredential.user.uid), {
      uid: userCredential.user.uid,
      firstName: employeeData.firstName,
      lastName: employeeData.lastName,
      email: employeeData.email,
      restaurant: employeeData.restaurant,
      role: 'employee',
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

// Get pending registrations for manager
export const getPendingRegistrations = async (restaurant) => {
  try {
    const q = query(
      collection(db, 'pendingRegistrations'),
      where('restaurant', '==', restaurant)
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

// Get employees for a restaurant
export const getEmployees = async (restaurant) => {
  try {
    const q = query(
      collection(db, 'users'),
      where('restaurant', '==', restaurant),
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