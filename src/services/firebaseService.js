import { db } from '../firebase/config';
import { 
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  deleteDoc
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth';

export async function getEmployeesByRestaurant(restaurantId) {
  const q = query(
    collection(db, 'users'),
    where('restaurants', 'array-contains', restaurantId),
    where('role', '==', 'employee')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function updateEmployeeStatus(employeeId, status) {
  const userRef = doc(db, 'users', employeeId);
  await updateDoc(userRef, { status });
}

export async function addNewEmployee(userData) {
  const userRef = doc(db, 'users', userData.uid);
  await setDoc(userRef, {
    ...userData,
    role: 'employee',
    status: 'Active',
    createdAt: new Date().toISOString()
  });
}

export async function getRestaurantDetails(restaurantId) {
  const docRef = doc(db, 'restaurants', restaurantId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
}

export async function registerEmployee({
  email,
  password,
  firstName,
  lastName,
  selectedRestaurant
}) {
  try {
    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      firstName,
      lastName,
      email,
      role: 'employee',
      status: 'Pending', // Will be updated to 'Active' by manager
      restaurant: selectedRestaurant,
      createdAt: new Date().toISOString(),
    });

    // Send password reset email so user can set their own password
    await sendPasswordResetEmail(auth, email);

    return userCredential.user;
  } catch (error) {
    throw error;
  }
}

export async function getPendingEmployees(restaurantId) {
  const q = query(
    collection(db, 'users'),
    where('restaurant', '==', restaurantId),
    where('status', '==', 'Pending')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function activateEmployee(employeeId) {
  const userRef = doc(db, 'users', employeeId);
  await updateDoc(userRef, { 
    status: 'Active',
    activatedAt: new Date().toISOString()
  });
}

export async function approveEmployee(employeeId) {
  try {
    const userRef = doc(db, 'users', employeeId);
    
    // Update user status to active
    await updateDoc(userRef, {
      status: 'Active',
      approvedAt: new Date().toISOString()
    });

    // Send password reset email to employee
    const userDoc = await getDoc(userRef);
    await sendPasswordResetEmail(auth, userDoc.data().email);

    return true;
  } catch (error) {
    console.error('Error approving employee:', error);
    throw error;
  }
}

export async function rejectEmployee(employeeId) {
  try {
    // Delete the user document
    await deleteDoc(doc(db, 'users', employeeId));
    return true;
  } catch (error) {
    console.error('Error rejecting employee:', error);
    throw error;
  }
}

export async function createManager({
  email,
  firstName,
  lastName,
  restaurants
}) {
  try {
    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    
    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, tempPassword);
    
    // Create manager document
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      firstName,
      lastName,
      email,
      role: 'manager',
      status: 'Active',
      restaurants, // Array of restaurant IDs they manage
      createdAt: new Date().toISOString(),
      createdBy: auth.currentUser.uid
    });

    // Send password reset email
    await sendPasswordResetEmail(auth, email);

    return userCredential.user;
  } catch (error) {
    throw error;
  }
}

export async function getAllManagers() {
  try {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'manager')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    throw error;
  }
}

export async function updateManagerRestaurants(managerId, restaurants) {
  try {
    const managerRef = doc(db, 'users', managerId);
    await updateDoc(managerRef, {
      restaurants,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    throw error;
  }
} 