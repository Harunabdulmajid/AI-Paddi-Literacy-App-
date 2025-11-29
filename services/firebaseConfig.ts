import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  // Use environment variable if available, otherwise fallback to the project key.
  // Note: If both are invalid, the app should gracefully degrade to offline mode.
  import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "gen-lang-client-0253287074.firebaseapp.com",
  projectId: "gen-lang-client-0253287074",
  storageBucket: "gen-lang-client-0253287074.firebasestorage.app",
  messagingSenderId: "879483311919",
  appId: "1:879483311919:web:b3ad4740a3ae78db3e33da",
  measurementId: "G-W30F9CTPC7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Analytics conditionally to prevent crashes if the API key is invalid or network is blocked
let analyticsInstance = null;
try {
  analyticsInstance = getAnalytics(app);
} catch (error) {
  console.warn("Firebase Analytics initialization failed:", error);
}
export const analytics = analyticsInstance;

export const db = getFirestore(app);
export const storage = getStorage(app);
