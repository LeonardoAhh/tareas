'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getFirestore } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  // CRITICAL: Call signInAnonymously directly. Do NOT use 'await signInAnonymously(...)'.
  signInAnonymously(authInstance);
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

/** Initiate email/password sign-up (returns Promise for error handling). */
export function initiateEmailSignUp(
  authInstance: Auth,
  email: string,
  password: string,
  profileData: { firstName: string; lastName: string }
): Promise<void> {
  return createUserWithEmailAndPassword(authInstance, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      // After creating the user, update their profile
      return updateProfile(user, {
        displayName: `${profileData.firstName} ${profileData.lastName}`,
      }).then(() => {
        // Then, create the user document in Firestore
        const db = getFirestore(authInstance.app);
        const userRef = doc(db, 'users', user.uid);

        const userData = {
          id: user.uid,
          email: user.email,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
        };

        return setDoc(userRef, userData).catch((error) => {
          errorEmitter.emit(
            'permission-error',
            new FirestorePermissionError({
              path: userRef.path,
              operation: 'create',
              requestResourceData: userData,
            })
          );
          throw error;
        });
      });
    });
}

/** Initiate email/password sign-in (returns Promise for error handling). */
export function initiateEmailSignIn(
  authInstance: Auth,
  email: string,
  password: string
): Promise<void> {
  return signInWithEmailAndPassword(authInstance, email, password)
    .then(() => {
      // Sign in successful, return void
      return;
    });
}
