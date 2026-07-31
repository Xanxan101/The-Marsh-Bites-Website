// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAuk_cIF3rIM1xbTxIOx5NbPdjV2hz2Ccg",
  authDomain: "marsh-bites.firebaseapp.com",
  projectId: "marsh-bites",
  storageBucket: "marsh-bites.firebasestorage.app",
  messagingSenderId: "54558348833",
  appId: "1:54558348833:web:2c3ce59341967f0451f560",
  measurementId: "G-C2NSHV4WJL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);