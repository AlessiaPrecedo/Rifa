import {
  doc,
  runTransaction,
  collection,
  serverTimestamp,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { db } from "../firebase/firebaseConfig.js";

export async function getTakenNumbersFromFirestore() {
  const snapshot = await getDocs(collection(db, "numbers"));
  const takenNumbers = [];

  snapshot.forEach((doc) => {
    takenNumbers.push(doc.data().numero); // 👈 solo el número
  });

  return takenNumbers;
}

export async function reservarNumerosSeguro({
  nombre,
  celular,
  numeros,
  metodoPago,
}) {
  await runTransaction(db, async (transaction) => {
    const numbersRefs = numeros.map((num) => doc(db, "numbers", String(num)));
    const userRef = doc(collection(db, "users"));

    // 🟢 READS
    for (const ref of numbersRefs) {
      const snap = await transaction.get(ref);
      if (snap.exists()) {
        throw new Error(`❌ El número ${ref.id} ya está reservado`);
      }
    }

    // 🟢 WRITES
    for (const ref of numbersRefs) {
      transaction.set(ref, {
        numero: Number(ref.id),
        nombre,
        celular,
        metodoPago,
        pagoConfirmado: false,
        createdAt: serverTimestamp(),
      });
    }

    transaction.set(userRef, {
      nombre,
      celular,
      numeros,
      metodoPago,
      pagoConfirmado: false,
      createdAt: serverTimestamp(),
    });
  });
}
