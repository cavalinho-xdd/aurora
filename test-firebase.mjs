import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, updateDoc, arrayUnion } from "firebase/firestore";

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
const auth = getAuth(app);
const db = getFirestore(app);

async function test() {
  try {
    console.log("Signing in...");
    const { createUserWithEmailAndPassword } = await import("firebase/auth");
    const email = "test" + Date.now() + "@example.com";
    const cred = await createUserWithEmailAndPassword(auth, email, "password123");
    console.log("Created user 1:", cred.user.uid);

    const { setDoc } = await import("firebase/firestore");
    await setDoc(doc(db, "users", cred.user.uid), { displayName: "test user" });
    
    const email2 = "test2" + Date.now() + "@example.com";
    const cred2 = await createUserWithEmailAndPassword(auth, email2, "password123");
    console.log("Created user 2:", cred2.user.uid);
    await setDoc(doc(db, "users", cred2.user.uid), { displayName: "test user 2" });

    console.log("Trying to update user 1 from user 2...");
    const friendRef = doc(db, "users", cred.user.uid);
    await updateDoc(friendRef, {
      friendRequests: arrayUnion(cred2.user.uid)
    });
    console.log("SUCCESS!");
  } catch(e) {
    console.error("ERROR:", e.code, e.message);
  }
  process.exit(0);
}
test();
