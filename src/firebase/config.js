// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCC9Bzela9Mhs2raQ0cQCSWJdm-GjnJvGg",
  authDomain: "law-loyalty.firebaseapp.com",
  projectId: "law-loyalty",
  storageBucket: "law-loyalty.firebasestorage.app",
  messagingSenderId: "18898180139",
  appId: "1:18898180139:web:115ada8b7ab0d8a9edb26e",
  measurementId: "G-XTKBQK7L33"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Authentication functions
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    return { ...userCredential.user, ...userDoc.data() };
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const registerUser = async (email, password, userData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCredential.user);
    
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      ...userData,
      email,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    });

    return userCredential.user;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};