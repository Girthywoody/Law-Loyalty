import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

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
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); 