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
    // We will create a new anonymous user or use an existing test account if we can't
    // Wait, let's just create a random user
    const { createUserWithEmailAndPassword } = await import("firebase/auth");
    const email = "test" + Date.now() + "@example.com";
    const cred = await createUserWithEmailAndPassword(auth, email, "password123");
    console.log("Created user:", cred.user.uid);

    // Create document for user
    const { setDoc } = await import("firebase/firestore");
    await setDoc(doc(db, "users", cred.user.uid), { displayName: "test user" });
    
    // Now try to update another user's document
    // We need another user id. Let's create another one.
    const email2 = "test2" + Date.now() + "@example.com";
    const cred2 = await createUserWithEmailAndPassword(auth, email2, "password123");
    await setDoc(doc(db, "users", cred2.user.uid), { displayName: "test user 2" });

    // Now as cred2, try to update cred1
    console.log("Trying to update cred1 from cred2...");
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
