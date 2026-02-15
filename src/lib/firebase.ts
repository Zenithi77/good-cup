import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim(),
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim(),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim(),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim(),
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim(),
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim(),
};

// Initialize Firebase
let app: FirebaseApp;
let db: Firestore;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  // Initialize Firestore with long polling to avoid QUIC protocol errors
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  });
} else {
  app = getApps()[0];
  db = getFirestore(app);
}

const auth = getAuth(app);

export { app, auth, db };
