export class Modal {
  constructor() {
    this.modal = document.getElementById("modal");
    this.closeBtn = document.getElementById("closeModal");
    this.mensajeExito = document.getElementById("mensajeExito");
    this.numerosSeleccionados = document.getElementById("numerosSeleccionados");

    this._init();
  }

  _init() {
    this.closeBtn.addEventListener("click", () => this.close());
    window.addEventListener("click", (e) => {
      if (e.target === this.modal) this.close();
    });
  }

  open(numeros) {
    this.numerosSeleccionados.textContent =
      "Tus números: " + numeros.join(", ");
    this.modal.style.display = "block";
  }

  close() {
    this.modal.style.display = "none";
  }

  showSuccess() {
    this.mensajeExito.style.display = "block";
    setTimeout(() => {
      this.mensajeExito.style.display = "none";
    }, 2000);
  }
}
