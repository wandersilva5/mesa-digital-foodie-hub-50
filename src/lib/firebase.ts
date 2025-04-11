
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDpVYkLHDC2NV5VLu4aCrMbH2xgmAcxNjo",
  authDomain: "food-management-app.firebaseapp.com",
  projectId: "food-management-app",
  storageBucket: "food-management-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456ghi789jkl"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

// For development only: Use local emulators if available 
// This helps with permissions issues when testing locally
const useEmulators = false; // Set to true to use local emulators

if (useEmulators) {
  // Connect to local Firestore emulator
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  // Connect to local Storage emulator
  connectStorageEmulator(storage, '127.0.0.1', 9199);
  
  console.log('Using Firebase Emulators for local development');
}

export default app;
