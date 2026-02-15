import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let app: App;
let adminDb: Firestore;

// Check if running on server
if (typeof window === 'undefined') {
  if (getApps().length === 0) {
    // Use service account credentials or default credentials
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (serviceAccount) {
      // Parse service account JSON from environment variable
      try {
        const parsedServiceAccount = JSON.parse(serviceAccount);
        app = initializeApp({
          credential: cert(parsedServiceAccount),
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
      } catch {
        // Fallback: use individual environment variables
        app = initializeApp({
          credential: cert({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          }),
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
      }
    } else if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      // Use individual environment variables
      app = initializeApp({
        credential: cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    } else {
      // Initialize without credentials (will use default application credentials)
      app = initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    }
  } else {
    app = getApps()[0];
  }
  
  adminDb = getFirestore(app);
}

export { adminDb };
