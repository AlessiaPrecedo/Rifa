import { getTakenNumbersFromFirestore } from "./data/firestorenumbers.js";

import { NumbersService } from "./services/NumbersService.js";
import { User } from "./models/User.js";
import { Modal } from "./ui/Modal.js";
import { reservarNumerosSeguro } from "./data/firestorenumbers.js";

// --------------------
// DATOS INICIALES
// --------------------
let numbersService;

const allNumbers = Array.from({ length: 100 }, (_, i) => i + 1);
async function initApp() {
  const takenNumbers = await getTakenNumbersFromFirestore();
  numbersService = new NumbersService(allNumbers, takenNumbers);
}

initApp();

const metodoPagoSelect = document.getElementById("metodoPago");
const transferenciaBox = document.getElementById("transferenciaBox");

metodoPagoSelect.addEventListener("change", () => {
  if (metodoPagoSelect.value === "transferencia") {
    transferenciaBox.classList.remove("hidden");
  } else {
    transferenciaBox.classList.add("hidden");
  }
});

// --------------------
// DOM
// --------------------
const contenedor = document.getElementById("disponibles");
const btnVer = document.querySelector(".btnVerNumeros");
const btnConfirmar = document.getElementById("confirmar");
const modal = document.getElementById("modal");
const closeModal = document.getElementById("closeModal");
const form = document.getElementById("userForm");
const mensajeExito = document.getElementById("mensajeExito");
const formLoader = document.getElementById("formLoader");
const submitBtn = form.querySelector("button[type='submit']");
console.log("btnVer:", btnVer);

// --------------------
// RENDER NUMEROS
// --------------------
function renderNumeros() {
  contenedor.innerHTML = "";

  allNumbers.forEach((num) => {
    const div = document.createElement("div");
    div.textContent = num;
    div.classList.add("numero");

    if (numbersService.isTaken(num)) {
      div.classList.add("ocupado");
    }

    if (numbersService.selectedNumbers.includes(num)) {
      div.classList.add("seleccionado");
    }
    div.addEventListener("click", () => {
      if (numbersService.isTaken(num)) return; // 🚫 no tocar ocupados

      numbersService.toggleNumber(num);
      renderNumeros();
    });

    contenedor.appendChild(div);
  });
}

// --------------------
// EVENTOS
// --------------------

let numerosVisibles = false;

btnVer.addEventListener("click", () => {
  if (!numerosVisibles) {
    renderNumeros();
    btnVer.textContent = "Ocultar números";
    numerosVisibles = true;
  } else {
    contenedor.innerHTML = "";
    btnVer.textContent = "Ver números";
    numerosVisibles = false;
  }
});

closeModal.addEventListener("click", () => {
  modal.style.display = "none";
});

// --------------------
// GUARDAR USUARIO
// --------------------
const modalUI = new Modal();

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = e.target.nombre.value.trim();
  const celular = e.target.celular.value.trim();
  const metodoPago = e.target.metodoPago.value;
  const numeros = [...numbersService.selectedNumbers];

  if (!nombre || !celular || !metodoPago || numeros.length === 0) {
    alert("Completá todos los campos");
    return;
  }

  try {
    submitBtn.disabled = true;

    // mostrar loader
    formLoader.classList.remove("hidden");
    mensajeExito.classList.add("hidden");

    await reservarNumerosSeguro({
      nombre,
      celular,
      numeros,
      metodoPago,
    });

    // ocultar loader
    formLoader.classList.add("hidden");

    // mostrar éxito
    mensajeExito.classList.remove("hidden");

    setTimeout(async () => {
      modalUI.close();
      form.reset();
      numbersService.selectedNumbers = [];
      submitBtn.disabled = false;
      mensajeExito.classList.add("hidden");
      await initApp();
    }, 2000);
  } catch (error) {
    console.error(error);
    formLoader.classList.add("hidden");
    submitBtn.disabled = false;
    alert(error.message);
  }
});

btnConfirmar.addEventListener("click", () => {
  if (numbersService.selectedNumbers.length === 0) {
    alert("Seleccioná al menos un número");
    return;
  }

  modalUI.open(numbersService.selectedNumbers);
});
