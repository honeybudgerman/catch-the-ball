// firebase-config.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

// TODO: Add your Firebase project configuration here
const firebaseConfig = {
    apiKey: "AIzaSyDT4Cm1gxwkxpW4GY3UTqCk0HAIigPuc5U",
    authDomain: "catch-the-ball-e7812.firebaseapp.com",
    projectId: "catch-the-ball-e7812",
    storageBucket: "catch-the-ball-e7812.appspot.com",
    messagingSenderId: "410047177701",
    appId: "1:410047177701:web:b446bdbca1c14936f1450c",
    measurementId: "G-S1WT3ETDXH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

// Anonymous sign-in
signInAnonymously(auth)
  .then(() => {
    console.log("Signed in anonymously");
  })
  .catch((error) => {
    console.error("Error signing in anonymously:", error);
  });

export { db, auth };
