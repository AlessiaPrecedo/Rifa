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
      💰 Total: $${(user.total ?? "Sin dato").toLocaleString("es-AR")}

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
const CLOUD_NAME = "dhl9hiafv";
const UPLOAD_PRESET = "atomic";
const FOTOS_KEY = "carrusel_fotos"; // clave en localStorage

const inputFoto = document.getElementById("inputFoto");
const btnSubirFoto = document.getElementById("btnSubirFoto");
const uploadStatus = document.getElementById("uploadStatus");
const listaFotos = document.getElementById("listaFotos");

// Obtener fotos guardadas
function getFotos() {
  return JSON.parse(localStorage.getItem(FOTOS_KEY) || "[]");
}

// Guardar fotos
function saveFotos(fotos) {
  localStorage.setItem(FOTOS_KEY, JSON.stringify(fotos));
}

// Renderizar fotos en el admin
function cargarFotosAdmin() {
  const fotos = getFotos();
  listaFotos.innerHTML = "";

  if (fotos.length === 0) {
    listaFotos.innerHTML = "<p>No hay fotos cargadas.</p>";
    return;
  }

  fotos.forEach((foto, index) => {
    listaFotos.innerHTML += `
      <div style="position:relative; width:120px;">
        <img src="${foto.url}" style="width:120px; height:90px; object-fit:cover; border-radius:8px;" />
        <button 
          onclick="eliminarFoto(${index})"
          style="position:absolute; top:4px; right:4px; background:red; color:white; border:none; border-radius:50%; cursor:pointer; width:22px; height:22px; font-size:12px;">
          ✕
        </button>
      </div>
    `;
  });
}
