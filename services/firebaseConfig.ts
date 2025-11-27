import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB7H20wazcLhBz0MCgPCnLqYIVptaMBo3U",
  authDomain: "ai-literacy-app-a7aff.firebaseapp.com",
  projectId: "ai-literacy-app-a7aff",
  storageBucket: "ai-literacy-app-a7aff.firebasestorage.app",
  messagingSenderId: "942413879792",
  appId: "1:942413879792:web:61a4b1334d88431ce92535",
  measurementId: "G-HS0J57FNDZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
