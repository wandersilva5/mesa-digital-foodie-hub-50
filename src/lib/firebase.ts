
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAtharQObPEFF0dNrtfSOQTCA6tGYbbODI",
  authDomain: "foodiehub-e3039.firebaseapp.com",
  projectId: "foodiehub-e3039",
  storageBucket: "foodiehub-e3039.firebasestorage.app",
  messagingSenderId: "80788699498",
  appId: "1:80788699498:web:f629092ff5bf437afe0d13",
  measurementId: "G-HWG1EK3V3Y"
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
