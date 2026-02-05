import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { db } from "../firebase/firebaseConfig.js";
export async function eliminarUsuarioYRestaurarNumeros(user) {
  try {
    // borrar números en collection "numbers"
    for (const num of user.numeros) {
      const numberRef = doc(db, "numbers", String(num));
      await deleteDoc(numberRef);
    }

    // borrar usuario
    const userRef = doc(db, "users", user.id);
    await deleteDoc(userRef);

    alert("Usuario eliminado y números restaurados ✅");
  } catch (error) {
    console.error(error);
    alert("Error al eliminar usuario");
  }
}
export function listenUsersRealtime(callback) {
  const usersRef = collection(db, "users");
  const q = query(usersRef, orderBy("createdAt", "desc"));

  onSnapshot(q, (snapshot) => {
    const users = [];

    snapshot.forEach((snap) => {
      users.push({
        id: snap.id,
        ...snap.data(),
      });
    });

    callback(users);
  });
}

export async function updatePagoConfirmado(userId) {
  const userRef = doc(db, "users", userId);

  await updateDoc(userRef, {
    pagoConfirmado: true,
  });
}
