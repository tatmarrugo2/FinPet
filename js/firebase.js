// ===== CONEXIÓN CON FIREBASE =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ESTE BLOQUE PROYECTO ↓↓
 const firebaseConfig = {
    apiKey: "AIzaSyDOYIf-bpHmMH3EPft-zfWy_c09fRoUVIY",
    authDomain: "finpet-7643d.firebaseapp.com",
    projectId: "finpet-7643d",
    storageBucket: "finpet-7643d.firebasestorage.app",
    messagingSenderId: "918970203749",
    appId: "1:918970203749:web:92dbf696c85fea1cfc908c",
    measurementId: "G-ZN5E6EZ6XH"
  };
// ↑↑

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);   // para el inicio de sesión
export const db = getFirestore(app); // para la base de datos