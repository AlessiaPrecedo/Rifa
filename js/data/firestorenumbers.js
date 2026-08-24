import {
  doc,
  runTransaction,
  collection,
  serverTimestamp,
  onSnapshot,
  getDocs,
  writeBatch,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { db } from "../firebase/firebaseConfig.js";

export const ESTADOS_NUMERO = Object.freeze({
  DISPONIBLE: "disponible",
  RESERVADO: "reservado",
  VENDIDO: "vendido",
});

const PRIMER_NUMERO = 0;
const ULTIMO_NUMERO = 299;

// Firestore guarda los documentos sin ceros a la izquierda; la interfaz muestra
// dos dígitos para 0-99 y tres para 100-299.
export function obtenerIdFirestoreNumero(numero) {
  const valor = Number(numero);

  if (
    !Number.isInteger(valor) ||
    valor < PRIMER_NUMERO ||
    valor > ULTIMO_NUMERO
  ) {
    throw new Error(`Número de rifa inválido: ${numero}`);
  }

  return String(valor);
}

function obtenerEtiquetaNumero(numero) {
  return obtenerIdFirestoreNumero(numero).padStart(2, "0");
}

export function normalizarEstadoNumero(estado) {
  // Compatibilidad con registros creados durante una versión anterior.
  return estado === "comprado" ? ESTADOS_NUMERO.VENDIDO : estado;
}

function crearMapaEstados(snapshot) {
  const states = {};

  snapshot.forEach((numberDoc) => {
    try {
      const id = numberDoc.id;

      // Convertimos el ID a número.
      const numero = Number(id);

      // ID oficial: sin ceros a la izquierda.
      const idOficial = String(numero);

      // Ignoramos documentos duplicados como "00", "01", "09".
      if (id !== idOficial) {
        return;
      }

      states[obtenerEtiquetaNumero(id)] = normalizarEstadoNumero(
        numberDoc.data().estado,
      );
    } catch {
      console.warn("Documento inválido ignorado:", numberDoc.id);
    }
  });

  return states;
}

// Mantiene la grilla sincronizada cuando una reserva se confirma o se libera.
export function listenNumberStates(callback, onError) {
  return onSnapshot(
    collection(db, "numbers"),
    (snapshot) => callback(crearMapaEstados(snapshot)),
    onError,
  );
}

// Crea los documentos faltantes sin tocar los números que ya tienen estado.
// Debe ejecutarse únicamente desde el panel de administración.
export async function inicializarNumerosRifa() {
  const snapshot = await getDocs(collection(db, "numbers"));
  const idsExistentes = new Set(snapshot.docs.map((numberDoc) => numberDoc.id));
  const batch = writeBatch(db);
  let creados = 0;

  for (let numero = PRIMER_NUMERO; numero <= ULTIMO_NUMERO; numero += 1) {
    const id = obtenerIdFirestoreNumero(numero);

    if (idsExistentes.has(id)) continue;

    batch.set(doc(db, "numbers", id), {
      estado: ESTADOS_NUMERO.DISPONIBLE,
      UsuarioId: "",
      fechaCreacion: serverTimestamp(),
    });
    creados += 1;
  }

  if (creados > 0) await batch.commit();

  return creados;
}

export async function reservarNumerosSeguro({
  nombre,
  celular,
  numeros,
  metodoPago,
}) {
  await runTransaction(db, async (transaction) => {
    const numbersRefs = numeros.map((num) =>
      doc(db, "numbers", obtenerIdFirestoreNumero(num)),
    );
    const userRef = doc(collection(db, "users"));

    for (const ref of numbersRefs) {
      const snap = await transaction.get(ref);
      if (
        snap.exists() &&
        normalizarEstadoNumero(snap.data().estado) !== ESTADOS_NUMERO.DISPONIBLE
      ) {
        throw new Error(
          `❌ El número ${obtenerEtiquetaNumero(ref.id)} ya no está disponible`,
        );
      }
    }

    const userId = userRef.id;

    for (const ref of numbersRefs) {
      transaction.set(
        ref,
        {
          estado: ESTADOS_NUMERO.RESERVADO,
          UsuarioId: userId,
          fechaTransaccion: serverTimestamp(),
        },
        { merge: true },
      );
    }

    // Calculamos el total con descuento
    const precioUnitario = 2500;
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
