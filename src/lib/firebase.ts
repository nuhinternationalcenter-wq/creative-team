import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: "creative-4fc55",
  appId: "1:803474057827:web:f0fc20cc4cbaa30e956656",
  apiKey: "AIzaSyAkphXpg--ZDqbKP2w3K40jLrQjPa2IMnU",
  authDomain: "creative-4fc55.firebaseapp.com",
  storageBucket: "creative-4fc55.firebasestorage.app",
  messagingSenderId: "803474057827",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-workflowtracker-4bf6cc96-5241-4ea2-ae9c-1c625d15fdcf");
export const auth = getAuth(app);
