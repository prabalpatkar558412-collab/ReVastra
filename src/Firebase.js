// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBWhx6C8-OSDQO_Tba0hHeyVA2Kuzfvglc",
  authDomain: "revastra-2b192.firebaseapp.com",
  projectId: "revastra-2b192",
  storageBucket: "revastra-2b192.firebasestorage.app",
  messagingSenderId: "166732625330",
  appId: "1:166732625330:web:69b7df52268185afef60ab",
   
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export { db };