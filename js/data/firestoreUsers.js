import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch, // Añadimos batch para que sea más rápido y seguro
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { db } from "../firebase/firebaseConfig.js";

export function listenUsersRealtime(callback) {
  const usersRef = collection(db, "users");
  // Asegúrate de que tus usuarios tengan el campo "fecha" o usa "orderBy('nombre')"
  const q = query(usersRef, orderBy("fecha", "desc"));

  onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map((snap) => ({
      id: snap.id,
      ...snap.data(),
    }));
    callback(users);
  });
}

export async function updatePagoConfirmado(user) {
  const batch = writeBatch(db);

  // 1. Actualizar el usuario
  const userRef = doc(db, "users", user.id);
  batch.update(userRef, { pagoConfirmado: true });

  // 2. Actualizar cada número a estado "vendido"
  user.numeros.forEach((num) => {
    const idFormateado = num.toString().padStart(2, "0");
    const numberRef = doc(db, "numbers", idFormateado);
    batch.update(numberRef, { estado: "vendido" });
  });

  try {
    await batch.commit();
    console.log("Pago confirmado y números marcados como vendidos");
  } catch (error) {
    console.error("Error al confirmar pago:", error);
    throw error;
  }
}

// --- ELIMINAR USUARIO Y RESTAURAR NÚMEROS A DISPONIBLE ---
export async function eliminarUsuarioYRestaurarNumeros(user) {
  try {
    const batch = writeBatch(db);

    // 1. RESTAURAR números (NO BORRAR)
    for (const num of user.numeros) {
      const idFormateado = num.toString().padStart(2, "0");
      const numberRef = doc(db, "numbers", idFormateado);

      // Volvemos el número a su estado inicial
      batch.update(numberRef, {
        estado: "disponible",
        UsuarioId: "",
      });
    }

    // 2. Borrar el documento del usuario
    const userRef = doc(db, "users", user.id);
    batch.delete(userRef);

    await batch.commit();
    alert("Usuario eliminado y números liberados ✅");
  } catch (error) {
    console.error("Error en la operación:", error);
    alert("Error al procesar la solicitud");
  }
}
