import {
  ESTADOS_NUMERO,
  listenNumberStates,
  reservarNumerosSeguro,
} from "./data/firestorenumbers.js";

import { NumbersService } from "./services/NumbersService.js";
import { Modal } from "./ui/Modal.js";
import { setupCopyButtons } from "./ui/copyButtons.js";
import parlante1 from "../assets/premios/parlante1.jpg";
import parlante2 from "../assets/premios/parlante2.jpg";
import luigi from "../assets/premios/luigi.jpg";

// --------------------
// DATOS INICIALES
// --------------------
let numbersService;
const MIN_CELULAR_DIGITOS = 10;
const MAX_CELULAR_DIGITOS = 15;

const allNumbers = Array.from({ length: 300 }, (_, i) => i).map((num) =>
  num.toString().padStart(2, "0"),
);

function actualizarEstados(statesMap) {
  const seleccionActual = numbersService?.selectedNumbers ?? [];
  numbersService = new NumbersService(allNumbers, statesMap);
  numbersService.selectedNumbers = seleccionActual.filter(
    (numId) =>
      numbersService.getEstado(numId) === ESTADOS_NUMERO.DISPONIBLE,
  );

  if (numerosVisibles) renderNumeros();
}

listenNumberStates(actualizarEstados, (error) => {
  console.error("No se pudieron cargar los estados de los números:", error);
  alert("No se pudieron cargar los números. Intentá recargar la página.");
});

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
const form = document.getElementById("userForm");
const mensajeExito = document.getElementById("mensajeExito");
const formLoader = document.getElementById("formLoader");
const submitBtn = form.querySelector("button[type='submit']");

function resetModalFormState() {
  form.reset();
  transferenciaBox.classList.add("hidden");
  formLoader.classList.add("hidden");
  mensajeExito.classList.add("hidden");
  submitBtn.disabled = false;
}

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

    if (estado === ESTADOS_NUMERO.VENDIDO) {
      div.classList.add("vendido");
    } else if (estado === ESTADOS_NUMERO.RESERVADO) {
      div.classList.add("reservado");
    }

    // Seleccion actual del usuario
    if (numbersService.selectedNumbers.includes(numId)) {
      div.classList.add("seleccionado");
    }

    div.addEventListener("click", () => {
      // Bloqueamos si no esta disponible
      if (estado !== ESTADOS_NUMERO.DISPONIBLE) return;

      numbersService.toggleNumber(numId);
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
  if (!numbersService) return; // <- guarda

  if (!numerosVisibles) {
    const hayDisponibles = allNumbers.some(
      (numId) =>
        numbersService.getEstado(numId) === ESTADOS_NUMERO.DISPONIBLE,
    );

    if (!hayDisponibles) {
      document.getElementById("modalSinNumeros").style.display = "block";
      return;
    }

    renderNumeros();
    btnVer.textContent = "Ocultar numeros";
    numerosVisibles = true;
  } else {
    contenedor.innerHTML = "";
    btnVer.textContent = "Ver numeros";
    numerosVisibles = false;
  }
});

// Cierre modalSinNumeros - fuera del btnConfirmar
document.getElementById("closeSinNumeros").addEventListener("click", () => {
  document.getElementById("modalSinNumeros").style.display = "none";
});
window.addEventListener("click", (e) => {
  if (e.target === document.getElementById("modalSinNumeros")) {
    document.getElementById("modalSinNumeros").style.display = "none";
  }
});

// --------------------
// GUARDAR USUARIO
// --------------------
const modalUI = new Modal(() => {
  resetModalFormState();
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = e.target.nombre.value.trim();
  const celular = e.target.celular.value.trim();
  const metodoPago = e.target.metodoPago.value;
  const numeros = [...numbersService.selectedNumbers];

  if (
    celular.length < MIN_CELULAR_DIGITOS ||
    celular.length > MAX_CELULAR_DIGITOS
  ) {
    alert(
      `El celular debe tener entre ${MIN_CELULAR_DIGITOS} y ${MAX_CELULAR_DIGITOS} numeros`,
    );
    return;
  }
  if (!nombre || !celular || !metodoPago || numeros.length === 0) {
    alert("Completa todos los campos");
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

    // mostrar exito
    mensajeExito.classList.remove("hidden");

    setTimeout(() => {
      mensajeExito.classList.add("hidden");
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
    alert("Selecciona al menos un numero");
    return;
  }

  modalUI.open(numbersService.selectedNumbers);
});

setupCopyButtons();

function cargarCarrusel() {
  const fotos = [
    parlante1,
    parlante2,
    luigi,
    // agregas o quitas fotos aca
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
        class="d-block w-100 premio-carrusel"
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
