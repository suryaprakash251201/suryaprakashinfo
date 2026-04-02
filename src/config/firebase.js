import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB6eYH9wq_fbR6fORDIEMR3z6yd3bD5C30",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "suryaprakashinfo-706a7.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "suryaprakashinfo-706a7",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "suryaprakashinfo-706a7.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "639412803388",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:639412803388:web:ee22e77397b51cef20f039",
  measurementId: "G-5SZN28V2G2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
