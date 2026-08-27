import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBrWvAivCYRiH5q_tPJ_yIbJBpUVoNgltw",
  authDomain: "creative-teame.firebaseapp.com",
  projectId: "creative-teame",
  storageBucket: "creative-teame.firebasestorage.app",
  messagingSenderId: "394693599319",
  appId: "1:394693599319:web:f609a929ccca8b10b04312",
  measurementId: "G-GN4ZD3Q07Z"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
