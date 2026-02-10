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

onAuthStateChanged(auth, (user) => {
  if (!user) {
    // Si no hay admin logueado, lo mandamos al login
    window.location.replace("login.html");
  } else {
    console.log("Acceso concedido al admin:", user.uid);

    // Solo llamar a la base de datos cuando ya estamos logueados
    listenUsersRealtime(renderAdminList);
  }
});

//cerrar sesion
const btnLogout = document.getElementById("btn-logout");
btnLogout.addEventListener("click", async () => {
  try {
    await signOut(auth);
    console.log("Admin deslogueado");
    window.location.replace("login.html");
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
});
const adminList = document.getElementById("adminList");

console.log("✅ admin.js cargado");

function renderAdminList(users) {
  adminList.innerHTML = "";

  users.forEach((user) => {
    const div = document.createElement("div");
    div.classList.add("admin-item");

    div.innerHTML = `
      <strong>${user.nombre}</strong><br>
      📞 ${user.celular}<br>
      🎟 ${user.numeros.join(", ")}<br>
      💳 ${user.metodoPago}<br>

      <button class="btnConfirmarPago" data-id="${user.id}">
        ${user.pagoConfirmado ? "✅ Pagado" : "❌ Pendiente"}
      </button>
      <button class="btnEliminar" data-id="${user.id}">🗑 Eliminar Usuario & restaurar numero/s</button>

      <hr>
    `;

    adminList.appendChild(div);
  });

  const botones = document.querySelectorAll(".btnConfirmarPago");

  botones.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const userId = btn.dataset.id;
      console.log("Confirmando pago:", userId);

      try {
        await updatePagoConfirmado(userId);
      } catch (error) {
        console.error("Error al confirmar pago:", error);
      }
    });
  });
  const botonesEliminar = document.querySelectorAll(".btnEliminar");

  botonesEliminar.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const userId = btn.dataset.id;

      const user = users.find((u) => u.id === userId);

      if (
        !confirm(
          "¿Seguro que querés eliminar este usuario y liberar los números?",
        )
      )
        return;

      await eliminarUsuarioYRestaurarNumeros(user);
    });
  });
}
