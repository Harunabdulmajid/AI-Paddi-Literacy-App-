import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyATJ9DydjsNiInO4A2iVIIqT-Diu0UftwI",
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
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
