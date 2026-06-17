import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAtGuJ10S0dzXgD0BCXI8EQOSpS63OXnvQ",
  authDomain: "stay-aurora.firebaseapp.com",
  projectId: "stay-aurora",
  storageBucket: "stay-aurora.firebasestorage.app",
  messagingSenderId: "135860160624",
  appId: "1:135860160624:web:e378cac1bdc2c99299ccb5",
  measurementId: "G-0QEHSFY5S2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
