import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// This endpoint creates an admin user in Firestore
// Call this once after registering an admin account
// POST /api/setup-admin with { email, uid }

export async function POST(request: Request) {
  try {
    const { email, uid } = await request.json();

    if (!email || !uid) {
      return NextResponse.json({ error: 'Email and UID required' }, { status: 400 });
    }

    // Check if user already exists
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      // Update existing user to admin
      await setDoc(userRef, { role: 'admin' }, { merge: true });
      return NextResponse.json({ message: 'User updated to admin', email });
    }

    // Create new admin user
    await setDoc(userRef, {
      email,
      name: 'Admin',
      role: 'admin',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ message: 'Admin user created', email });
  } catch (error) {
    console.error('Setup admin error:', error);
    return NextResponse.json({ error: 'Failed to setup admin' }, { status: 500 });
  }
}
