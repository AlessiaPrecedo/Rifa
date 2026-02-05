export class User {
  constructor(nombre, celular, numeros) {
    this.nombre = nombre;
    this.celular = celular;
    this.numeros = numeros;
    this.fecha = new Date().toISOString();
  }

  validate(takenNumbers) {
    if (!this.nombre || !this.celular) {
      throw new Error("Datos incompletos");
    }

    if (this.numeros.length === 0) {
      throw new Error("No seleccionaste números");
    }

    const conflicto = this.numeros.some((n) => takenNumbers.includes(n));
    if (conflicto) {
      throw new Error("Uno o más números ya están ocupados");
    }
  }
}
