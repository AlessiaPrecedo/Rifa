import {
  doc,
  runTransaction,
  collection,
  serverTimestamp,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { db } from "../firebase/firebaseConfig.js";

// 1. Obtener todos los números para pintar el mapa de la rifa
export async function getTakenNumbersFromFirestore() {
  const snapshot = await getDocs(collection(db, "numbers"));
  const states = {};

  snapshot.forEach((doc) => {
    // Retornamos un objeto donde la clave es el número y el valor es su estado
    states[doc.id] = doc.data().estado;
  });

  return states;
}

// 2. Transacción segura para reservar
export async function reservarNumerosSeguro({
  nombre,
  celular,
  numeros,
  metodoPago,
}) {
  await runTransaction(db, async (transaction) => {
    // Formateamos los IDs a "00", "01", etc.
    const numbersRefs = numeros.map((num) =>
      doc(db, "numbers", String(num).padStart(2, "0")),
    );
    const userRef = doc(collection(db, "users"));

    // --- LECTURAS (READS) ---
    for (const ref of numbersRefs) {
      const snap = await transaction.get(ref);
      if (!snap.exists()) {
        throw new Error(`❌ El número ${ref.id} no existe en la base de datos`);
      }
      if (snap.data().estado !== "disponible") {
        throw new Error(`❌ El número ${ref.id} ya no está disponible`);
      }
    }

    // --- ESCRITURAS (WRITES) ---
    const userId = userRef.id;

    for (const ref of numbersRefs) {
      transaction.update(ref, {
        estado: "reservado",
        UsuarioId: userId,
        fechaTransaccion: serverTimestamp(),
      });
    }

    // Calculamos el total con descuento
    const precioUnitario = 4000;
    const tieneDescuento = numeros.length >= 2;
    const subtotal = numeros.length * precioUnitario;
    const total = tieneDescuento ? subtotal * 0.75 : subtotal;

    transaction.set(userRef, {
      nombre,
      celular,
      numeros,
      metodoPago,
      total,
      pagoConfirmado: false,
      fecha: serverTimestamp(),
    });
  });
}
