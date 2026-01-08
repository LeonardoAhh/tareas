'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

export function initializeFirebase() {
  if (!getApps().length) {
    let firebaseApp;

    // En desarrollo o cuando no hay variables de entorno de Firebase Hosting,
    // usar directamente la configuración
    if (process.env.NODE_ENV === "development" || !process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      firebaseApp = initializeApp(firebaseConfig);
    } else {
      // En producción con Firebase App Hosting, intentar auto-inicialización
      try {
        firebaseApp = initializeApp();
      } catch (e) {
        // Fallback a configuración manual si falla
        firebaseApp = initializeApp(firebaseConfig);
      }
    }

    return getSdks(firebaseApp);
  }

  // Si ya está inicializado, retornar los SDKs con la app ya inicializada
  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
