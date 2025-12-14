// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBiut37pSd7Zfly6XZSfPvIoTN2dC0tijo",
    authDomain: "stock-photo-store.firebaseapp.com",
    projectId: "stock-photo-store",
    storageBucket: "stock-photo-store.appspot.com",
    messagingSenderId: "474352772424",
    appId: "1:474352772424:web:bf8f01afc7f6029c8d7f7d",
    measurementId: "G-5WVKKLF5EF"
};

// Init App
const app = initializeApp(firebaseConfig);

// Init Auth
export const auth = getAuth(app);

// Init Google Provider 
export const googleProvider = new GoogleAuthProvider();
