import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, getDocs, collection, query, where } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [userRestaurants, setUserRestaurants] = useState([]);

  async function login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check each collection for the user
      const collections = ['admins', 'managers', 'employees'];
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

      setUserRole(userData.role);
      if (userData.role === 'manager') {
        setUserRestaurants(userData.restaurants || []);
      }

      return { ...userData, collection: userCollection };
    } catch (error) {
      throw error;
    }
  }

  function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        
        const restaurant = userData.restaurant;
        const processedRestaurant = typeof restaurant === 'object' ? restaurant.id : restaurant;
        
        setCurrentUser({ 
          ...user, 
          ...userData,
          restaurant: processedRestaurant
        });
        setUserRole(userData.role);
        setUserRestaurants(userData.restaurants || []);
      } else {
        setCurrentUser(null);
        setUserRole(null);
        setUserRestaurants([]);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    userRestaurants,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 