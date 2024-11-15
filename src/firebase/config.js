//src/firebase/config.js

// Import necessary Firebase modules
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCC9Bzela9Mhs2raQ0cQCSWJdm-GjnJvGg",
  authDomain: "law-loyalty.firebaseapp.com",
  projectId: "law-loyalty",
  storageBucket: "law-loyalty.firebasestorage.app",
  messagingSenderId: "18898180139",
  appId: "1:18898180139:web:115ada8b7ab0d8a9edb26e",
  measurementId: "G-XTKBQK7L33"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// User types enum
const UserType = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee'
};

// Authentication functions
export const registerUser = async (email, password, userData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCredential.user);
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      ...userData,
      email,
      status: 'pending',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    });

    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

// Login function
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Update last login
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      lastLogin: new Date().toISOString()
    }, { merge: true });

    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

// Get user data including type (admin/manager/employee)
export const getUserData = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    throw error;
  }
};

// Restaurant data
export const RESTAURANTS = [
  { id: "montanas", name: "Montana's", discount: "20%" },
  { id: "kelseys", name: "Kelsey's", discount: "20%" },
  { id: "coras", name: "Cora's Breakfast", discount: "10%" },
  { id: "js-roadhouse", name: "J's Roadhouse", discount: "20%" },
  { id: "swiss-chalet", name: "Swiss Chalet", discount: "20%" },
  {
    id: "overtime-bar",
    name: "Overtime Bar",
    discount: "20%",
    locations: [
      { id: "overtime-sudbury", name: "Sudbury" },
      { id: "overtime-val-caron", name: "Val Caron" },
      { id: "overtime-chelmsford", name: "Chelmsford" }
    ]
  },
  { id: "lot-88", name: "Lot 88 Steakhouse", discount: "20%" },
  { id: "poke-bar", name: "Poke Bar", discount: "20%" },
  {
    id: "happy-life",
    name: "Happy Life",
    discount: "10%",
    locations: [
      { id: "happy-life-kingsway", name: "Kingsway" },
      { id: "happy-life-val-caron", name: "Val Caron" },
      { id: "happy-life-chelmsford", name: "Chelmsford" }
    ]
  }
];