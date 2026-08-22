import {
  ESTADOS_NUMERO,
  normalizarEstadoNumero,
} from "../data/firestorenumbers.js";

export class NumbersService {
  constructor(allNumbers, statesMap) {
    this.allNumbers = allNumbers;
    this.statesMap = statesMap; // Guardamos el objeto de Firestore
    this.selectedNumbers = [];
  }

  getEstado(numId) {
    // Si el número no existe en el mapa, por defecto está disponible
    return (
      normalizarEstadoNumero(this.statesMap[numId]) ||
      ESTADOS_NUMERO.DISPONIBLE
    );
  }

  toggleNumber(numId) {
    if (this.selectedNumbers.includes(numId)) {
      this.selectedNumbers = this.selectedNumbers.filter((n) => n !== numId);
    } else {
      this.selectedNumbers.push(numId);
    }
  }
}
