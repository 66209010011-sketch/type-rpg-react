// firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Config จาก Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBMO2qN3SdY6yNYSirUnNJU5OfhhB3VZuE",
  authDomain: "words-81f1f.firebaseapp.com",
  databaseURL: "https://words-81f1f-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "words-81f1f",
  storageBucket: "words-81f1f.firebasestorage.app",
  messagingSenderId: "1011172541447",
  appId: "1:1011172541447:web:027e19e6983366a371d6a2",
  measurementId: "G-Q7QNLCEYHX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Analytics (ใช้ได้ถ้าเว็บเป็น HTTPS และเปิด GA ใน Firebase)
const analytics = getAnalytics(app);

// ✅ Initialize Auth และ Firestore
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);

// ฟังก์ชัน Login/Logout
export const loginWithGoogle = () => signInWithPopup(auth, provider);
export const logout = () => signOut(auth);

export { app };
