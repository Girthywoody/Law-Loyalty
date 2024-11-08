import { db } from '../firebase/config';
import { 
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail 
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