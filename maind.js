//Numeros disponibles
const numbers = Array.from({ length: 100 }, (_, i) => i + 1);
let users = JSON.parse(localStorage.getItem("users")) || [];
let takenNumbers = JSON.parse(localStorage.getItem("takenNumbers")) || [];

// --- CLASE: MANEJO DE NÚMEROS ---
class NumerosDisponibles {
  constructor(Ln) {
    this.numbers = Ln;
    this.selected = [];
    this.taken = takenNumbers;
    this.visible = false;
  }

  MostrarNumeros() {
    const cont = document.getElementById("disponibles");

    if (this.visible) {
      cont.innerHTML = ""; // ocultar
      this.visible = false;
      return;
    }

    cont.innerHTML = ""; // mostrar

    this.numbers.forEach((n) => {
      const div = document.createElement("div");
      div.textContent = n;
      div.classList.add("numero");

      if (this.taken.includes(n)) {
        div.classList.add("ocupado");
        div.style.pointerEvents = "none";
      } else {
        div.addEventListener("click", () => {
          if (this.selected.includes(n)) {
            this.selected = this.selected.filter((num) => num !== n);
            div.classList.remove("seleccionado");
          } else {
            this.selected.push(n);
            div.classList.add("seleccionado");
          }
        });
      }

      cont.appendChild(div);
    });

    this.visible = true;
  }

  // Marcar como ocupados los números seleccionados
  MarcarComoOcupados() {
    this.taken = [...this.taken, ...this.selected];
    localStorage.setItem("takenNumbers", JSON.stringify(this.taken));
    this.selected = [];
  }
}

// --- CLASE: USUARIO ---
class User {
  constructor(Name, cel, SelecNum) {
    this.Name = Name;
    this.cel = cel;
    this.SelecNum = SelecNum;
  }

  ValidationAndSave() {
    if (!this.Name || !this.cel || this.SelecNum.length === 0) {
      throw new Error("Faltan datos o no seleccionaste números");
    }

    // 🔒 PREVENIR DOBLE RESERVA
    const taken = JSON.parse(localStorage.getItem("takenNumbers")) || [];

    const conflicto = this.SelecNum.some((num) => taken.includes(num));

    if (conflicto) {
      throw new Error(
        "Uno o más números ya fueron reservados. Actualizá la lista."
      );
    }
  }

  async SaveUser() {
    this.ValidationAndSave();
    users.push(this);
    localStorage.setItem("users", JSON.stringify(users));
    return true;
  }
}

// --- INSTANCIAS Y EVENTOS ---
const AdminNumbers = new NumerosDisponibles(numbers);

// Mostrar los números
const btn = document.querySelector("#disponibles").previousElementSibling;
btn.addEventListener("click", () => {
  AdminNumbers.MostrarNumeros();
});

// Confirmar selección (abrir modal)
document.getElementById("confirmar").addEventListener("click", () => {
  if (AdminNumbers.selected.length === 0) {
    alert("Por favor, selecciona al menos un número.");
  } else {
    const modal = document.getElementById("modal");
    const numerosSeleccionados = document.getElementById(
      "numerosSeleccionados"
    );
    numerosSeleccionados.textContent =
      "Tus números: " + AdminNumbers.selected.join(", ");
    modal.style.display = "block";
  }
});

// Cerrar modal
document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("modal").style.display = "none";
});
function load() {
  let loading = document.getElementById("modal");
  setTimeout(() => {
    loading.style.display = "none";
  }, 2000);
}
window.addEventListener("click", (e) => {
  const modal = document.getElementById("modal");
  const editar = document.getElementById("editar");
  if (e.target === modal || e.target === editar) {
    load();
  }
});

// Guardar usuario
document.getElementById("userForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value;
  const celular = document.getElementById("celular").value;
  const modal = document.getElementById("modal");
  const mensajeExito = document.getElementById("mensajeExito");

  const user = new User(nombre, celular, AdminNumbers.selected);

  try {
    await user.SaveUser();

    AdminNumbers.MarcarComoOcupados();

    mensajeExito.style.display = "block";

    setTimeout(() => {
      modal.style.display = "none";
      mensajeExito.style.display = "none";
      e.target.reset();
      AdminNumbers.MostrarNumeros();
    }, 2000);
  } catch (error) {
    alert(error.message);
  }
});
