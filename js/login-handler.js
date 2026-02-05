import { auth, db } from "./firebase/firebaseConfig.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const loginForm = document.getElementById("login-form");
const btnLogin = document.getElementById("btn-login");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    btnLogin.disabled = true;
    btnLogin.textContent = "Cargando...";

    await signInWithEmailAndPassword(auth, email, password);

    // Redirección limpia al panel de admin
    window.location.replace("admin.html");
  } catch (error) {
    console.error("Error de autenticación:", error.code);
    alert("Credenciales incorrectas");
    btnLogin.disabled = false;
    btnLogin.textContent = "Entrar al Panel";
  }
});
