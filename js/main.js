import { getTakenNumbersFromFirestore } from "./data/firestorenumbers.js";

import { NumbersService } from "./services/NumbersService.js";
import { Modal } from "./ui/Modal.js";
import { reservarNumerosSeguro } from "./data/firestorenumbers.js";

// --------------------
// DATOS INICIALES
// --------------------
let numbersService;

const allNumbers = Array.from({ length: 100 }, (_, i) => i).map((num) =>
  num.toString().padStart(2, "0"),
);

async function initApp() {
  const statesMap = await getTakenNumbersFromFirestore();

  numbersService = new NumbersService(allNumbers, statesMap);

  if (numerosVisibles) renderNumeros();
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

  allNumbers.forEach((numId) => {
    const div = document.createElement("div");
    div.textContent = numId;
    div.classList.add("numero");

    // Obtenemos el estado directamente del service usando el ID ("01", "02"...)
    const estado = numbersService.getEstado(numId);

    if (estado === "vendido") {
      div.classList.add("vendido");
    } else if (estado === "reservado") {
      div.classList.add("reservado");
    }

    // Selección actual del usuario
    if (numbersService.selectedNumbers.includes(numId)) {
      div.classList.add("seleccionado");
    }

    div.addEventListener("click", () => {
      // Bloqueamos si no está disponible
      if (estado !== "disponible") return;

      numbersService.toggleNumber(numId);
      renderNumeros();
    });

    contenedor.appendChild(div);
  });
}

// --------------------
// EVENTOS
// --------------------
// --------------------
// EVENTOS
// --------------------

let numerosVisibles = false;
btnVer.addEventListener("click", () => {
  if (!numbersService) return; // ← guarda

  if (!numerosVisibles) {
    const hayDisponibles = allNumbers.some(
      (numId) => numbersService.getEstado(numId) === "disponible",
    );

    if (!hayDisponibles) {
      document.getElementById("modalSinNumeros").style.display = "block";
      return;
    }

    renderNumeros();
    btnVer.textContent = "Ocultar números";
    numerosVisibles = true;
  } else {
    contenedor.innerHTML = "";
    btnVer.textContent = "Ver números";
    numerosVisibles = false;
  }
});

// Cierre modalSinNumeros — fuera del btnConfirmar
document.getElementById("closeSinNumeros").addEventListener("click", () => {
  document.getElementById("modalSinNumeros").style.display = "none";
});
window.addEventListener("click", (e) => {
  if (e.target === document.getElementById("modalSinNumeros")) {
    document.getElementById("modalSinNumeros").style.display = "none";
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

function cargarCarrusel() {
  const fotos = [
    "assets/premios/premio1.jpg",
    "assets/premios/premio2.jpg",
    "assets/premios/premio3.jpg",
    "assets/premios/premio4.jpg",
    "assets/premios/premio5.jpg",
    // agregás o quitás fotos acá
  ];
  const inner = document.getElementById("carruselInner");
  const sinFotos = document.getElementById("sinFotos");

  if (fotos.length === 0) {
    sinFotos.style.display = "block";
    return;
  }

  fotos.forEach((foto, index) => {
    inner.innerHTML += `
      <div class="carousel-item ${index === 0 ? "active" : ""}">
        <img 
          src="${foto}" 
          class="d-block w-100" 
          style="max-height:400px; object-fit:cover; border-radius:10px; cursor:zoom-in;"
          onclick="abrirZoom('${foto}')"
        />
      </div>
    `;
  });
}

cargarCarrusel();
// Zoom
window.abrirZoom = (src) => {
  const modal = document.getElementById("modalZoom");
  const img = document.getElementById("imgZoom");
  img.src = src;
  modal.style.display = "flex";
};

window.cerrarZoom = () => {
  document.getElementById("modalZoom").style.display = "none";
};

// Cerrar con ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") cerrarZoom();
});
