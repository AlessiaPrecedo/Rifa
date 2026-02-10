import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"; // Nuevo

const firebaseConfig = {
  apiKey: "AIzaSyBEjOfnMOyFT0eiS-Ig2XLY16b-MhHB_Uo",
  authDomain: "atomic-rifa.firebaseapp.com",
  projectId: "atomic-rifa",
  storageBucket: "atomic-rifa.firebasestorage.app",
  messagingSenderId: "768628407888",
  appId: "1:768628407888:web:b49f7fd697ca7c06439b55",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
// Exportamos auth para el login
