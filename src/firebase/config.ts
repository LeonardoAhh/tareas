// Firebase configuration with environment variables support
// In production, set these as NEXT_PUBLIC_* environment variables in Vercel
export const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-5066031299-cff98",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:226566165354:web:19ffd5a810055f14d54b13",
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAgDWEAdqwL4_BdFPIyr_CrN_HnWBtc5DA",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "studio-5066031299-cff98.firebaseapp.com",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "226566165354"
};
