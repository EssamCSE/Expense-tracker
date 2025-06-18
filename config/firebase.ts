
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import AsyncStorage from "@react-native-async-storage/async-storage";

import { getReactNativePersistence, initializeAuth } from 'firebase/auth';

import { getFirestore } from "firebase/firestore";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCyGoeKajV5ZcHRxyIhRJje0iZK53mW-nE",
  authDomain: "expenses-e85e9.firebaseapp.com",
  projectId: "expenses-e85e9",
  storageBucket: "expenses-e85e9.firebasestorage.app",
  messagingSenderId: "8360970896",
  appId: "1:8360970896:web:672da31ad36724ed8d2615",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// auth

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// db

export const firestore = getFirestore(app);
