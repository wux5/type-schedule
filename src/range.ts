export default class Range {
  start: number;
  end: number;
  step: number;

  constructor(start?: number, end?: number, step?: number) {
    this.start = start || 0;
    this.end = end || 60;
    this.step = step || 1;
  }

  contains(val: number): boolean {
    if (this.step === 1) {
      return (val >= this.start && val <= this.end);
    } else {
      for (let i = this.start; i < this.end; i += this.step) {
        if (i === val) {
          return true;
        }
      }
      return false;
    }
  }
}
