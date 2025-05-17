// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBxsyHeTx6BwWNRJeM1x3a_5wuhyzMmwtA",
    authDomain: "my-calorie-app-1261a.firebaseapp.com",
    projectId: "my-calorie-app-1261a",
    storageBucket: "my-calorie-app-1261a.appspot.com", // <-- fix typo: was .app, should be .app**spot**.com
    messagingSenderId: "86396951018",
    appId: "1:86396951018:web:6152c4677cbc2ec231fa93",
    measurementId: "G-H1FWY26NHP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);