// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDVbhuD67Fkr03ghgrLbu7oitsu3wQfRhI",
  authDomain: "menus-planner.firebaseapp.com",
  projectId: "menus-planner",
  storageBucket: "menus-planner.firebasestorage.app",
  messagingSenderId: "471077553856",
  appId: "1:471077553856:web:27a1e8a1eb4ed64f1e4f25",
  measurementId: "G-WT98JMD9EC"
};

// Inicializamos Firebase
const app = initializeApp(firebaseConfig);

// Exportamos la base de datos Firestore
export const db = getFirestore(app);