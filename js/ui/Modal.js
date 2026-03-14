export class Modal {
  constructor() {
    this.modal = document.getElementById("modal");
    this.closeBtn = document.getElementById("closeModal");
    this.mensajeExito = document.getElementById("mensajeExito");
    this.numerosSeleccionados = document.getElementById("numerosSeleccionados");
    this.totalPagar = document.getElementById("totalPagar");

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

    const precioUnitario = 3000;
    const tieneDescuento = numeros.length >= 2;
    const subtotal = numeros.length * precioUnitario;
    const total = tieneDescuento ? subtotal * 0.75 : subtotal;

    this.totalPagar.innerHTML = tieneDescuento
      ? `<s>$${subtotal.toLocaleString("es-AR")}</s> $${total.toLocaleString("es-AR")} <span style="color: green">(25% OFF)</span>`
      : `$${total.toLocaleString("es-AR")}`;

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
