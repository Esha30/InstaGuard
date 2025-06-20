// lib/firebaseconfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";  // Import Firebase Authentication
import { getAnalytics } from "firebase/analytics";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCrGx81g32M93Hp572XzmJu1Wxa89i10Xw",
  authDomain: "instaguard-c9299.firebaseapp.com",
  projectId: "instaguard-c9299",
  storageBucket: "instaguard-c9299.firebasestorage.app",
  messagingSenderId: "114037389273",
  appId: "1:114037389273:web:a66d851dba13f281128bc8",
  measurementId: "G-4LQS2T5FQZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get the authentication and analytics instances
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
