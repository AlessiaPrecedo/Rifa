export class NumbersService {
  constructor(allNumbers, takenNumbers = []) {
    this.allNumbers = allNumbers;
    this.takenNumbers = takenNumbers;
    this.selectedNumbers = [];
  }

  toggleNumber(num) {
    if (this.takenNumbers.includes(num)) return;

    if (this.selectedNumbers.includes(num)) {
      this.selectedNumbers = this.selectedNumbers.filter((n) => n !== num);
    } else {
      this.selectedNumbers.push(num);
    }
  }

  confirmSelection() {
    this.takenNumbers.push(...this.selectedNumbers);
    this.selectedNumbers = [];
  }

  isTaken(num) {
    return this.takenNumbers.includes(num);
  }
}
