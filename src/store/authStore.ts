'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  isEmployee: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (name: string, email: string, phone: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  setFirebaseUser: (user: FirebaseUser | null) => void;
  setLoading: (loading: boolean) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      firebaseUser: null,
      loading: true,
      error: null,
      isAdmin: false,
      isEmployee: false,

      signIn: async (email: string, password: string) => {
        try {
          set({ loading: true, error: null });
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
            const isAdminUser = email === adminEmail || userData.role === 'admin';
            set({
              user: userData,
              firebaseUser: userCredential.user,
              isAdmin: isAdminUser,
              isEmployee: !isAdminUser && userData.role === 'employee',
              loading: false
            });
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Нэвтрэхэд алдаа гарлаа';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      signInWithGoogle: async () => {
        try {
          set({ loading: true, error: null });
          const provider = new GoogleAuthProvider();
          const result = await signInWithPopup(auth, provider);
          const firebaseUser = result.user;
          
          // Check if user already exists in Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            // Existing user - get their data
            const userData = userDoc.data() as User;
            const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
            const isAdminUser = firebaseUser.email === adminEmail || userData.role === 'admin';
            set({
              user: userData,
              firebaseUser: firebaseUser,
              isAdmin: isAdminUser,
              isEmployee: !isAdminUser && userData.role === 'employee',
              loading: false
            });
          } else {
            // New user - create their profile
            const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
            const userData: User = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || '',
              email: firebaseUser.email || '',
              phone: '',
              role: firebaseUser.email === adminEmail ? 'admin' : 'user',
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            await setDoc(doc(db, 'users', firebaseUser.uid), userData);
            
            set({ 
              user: userData, 
              firebaseUser: firebaseUser,
              isAdmin: firebaseUser.email === adminEmail,
              loading: false 
            });
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Google-ээр нэвтрэхэд алдаа гарлаа';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      signUp: async (name: string, email: string, phone: string, password: string) => {
        try {
          set({ loading: true, error: null });
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          
          const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
          const userData: User = {
            id: userCredential.user.uid,
            name,
            email,
            phone,
            role: email === adminEmail ? 'admin' : 'user',
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          // Save user data to Firestore
          await setDoc(doc(db, 'users', userCredential.user.uid), userData);
          
          set({ 
            user: userData, 
            firebaseUser: userCredential.user,
            isAdmin: email === adminEmail,
            loading: false 
          });
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Бүртгүүлэхэд алдаа гарлаа';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      signOut: async () => {
        try {
          await firebaseSignOut(auth);
          set({ user: null, firebaseUser: null, isAdmin: false, isEmployee: false });
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Гарахад алдаа гарлаа';
          set({ error: errorMessage });
        }
      },

      setUser: (user) => {
        const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
        const isAdminUser = user?.email === adminEmail || user?.role === 'admin';
        set({ user, isAdmin: isAdminUser, isEmployee: !isAdminUser && user?.role === 'employee' });
      },
      setFirebaseUser: (firebaseUser) => set({ firebaseUser }),
      setLoading: (loading) => set({ loading }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'good-cup-auth',
      partialize: (state) => ({ user: state.user, isAdmin: state.isAdmin, isEmployee: state.isEmployee }),
    }
  )
);

// Listen to auth state changes
if (typeof window !== 'undefined') {
  onAuthStateChanged(auth, async (firebaseUser) => {
    const store = useAuthStore.getState();
    
    if (firebaseUser) {
      store.setFirebaseUser(firebaseUser);
      
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
        const isAdminUser = firebaseUser.email === adminEmail || userData.role === 'admin';
        store.setUser(userData);
        useAuthStore.setState({ isAdmin: isAdminUser, isEmployee: !isAdminUser && userData.role === 'employee' });
      }
    } else {
      store.setUser(null);
      store.setFirebaseUser(null);
    }
    
    store.setLoading(false);
  });
}
