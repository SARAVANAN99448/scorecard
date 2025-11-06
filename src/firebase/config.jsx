// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD9qWlCZhF6KHQ8dThXc2rUwfZfu3qvl2Y",
  authDomain: "cricket-5dac3.firebaseapp.com",
  projectId: "cricket-5dac3",
  storageBucket: "cricket-5dac3.firebasestorage.app",
  messagingSenderId: "236675308895",
  appId: "1:236675308895:web:fdcaf319e726083486eaea"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);