import {
  listenUsersRealtime,
  updatePagoConfirmado,
  eliminarUsuarioYRestaurarNumeros,
} from "./data/firestoreUsers.js";
import { auth, db } from "./firebase/firebaseConfig.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- SEGURIDAD Y CARGA ---
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.replace("login.html");
  } else {
    console.log("Acceso concedido al admin:", user.uid);
    listenUsersRealtime(renderAdminList);
  }
});

// --- CERRAR SESIÓN ---
const btnLogout = document.getElementById("btn-logout");
btnLogout.addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.replace("login.html");
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
});

// --- RENDERIZADO DE LA LISTA ---
const adminList = document.getElementById("adminList");

function renderAdminList(users) {
  adminList.innerHTML = "";

  users.forEach((user) => {
    const div = document.createElement("div");
    div.classList.add("admin-item");

    div.innerHTML = `
      <strong>👤 ${user.nombre}</strong><br>
      📞 ${user.celular}<br>
      🎟 Números: ${user.numeros.join(", ")}<br>
      💳 Pago: ${user.metodoPago}<br>

      <button class="btnConfirmarPago" data-id="${user.id}">
        ${user.pagoConfirmado ? "✅ Pagado" : "❌ Pendiente"}
      </button>
      <button class="btnEliminar" data-id="${user.id}">🗑 Eliminar y Liberar</button>
      <hr>
    `;
    adminList.appendChild(div);
  });

  configurarBotones(users);
}

// --- LÓGICA DE BOTONES ---
// --- LÓGICA DE BOTONES DENTRO DE RENDER ---
function configurarBotones(users) {
  // 1. CONFIRMAR PAGO
  document.querySelectorAll(".btnConfirmarPago").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const userId = btn.dataset.id;
      const user = users.find((u) => u.id === userId); // Buscamos el objeto completo

      if (user) {
        try {
          // Pasamos el objeto 'user' completo
          await updatePagoConfirmado(user);
        } catch (error) {
          console.error("Error al confirmar pago:", error);
        }
      }
    });
  });

  // 2. ELIMINAR Y LIBERAR
  document.querySelectorAll(".btnEliminar").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const userId = btn.dataset.id;
      const user = users.find((u) => u.id === userId); // Buscamos el objeto completo

      if (
        user &&
        confirm(
          "¿Seguro que querés eliminar este usuario y liberar sus números?",
        )
      ) {
        await eliminarUsuarioYRestaurarNumeros(user);
      }
    });
  });
}
