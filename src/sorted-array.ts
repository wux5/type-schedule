export interface IComparer<T> {
  (a: T, b: T): number;
}

function defaultCompare<T>(a: T, b: T) {
  if (a === b) {
    return 0;
  }
  return a < b ? -1 : 1;
}

export class SortedArray<T> {
  array: T[] = [];
  compare: IComparer<T>;

  constructor(array: T[], compare?: IComparer<T>) {
    this.compare = compare || defaultCompare;

    const length: number = array.length;
    let index: number = 0;
    while (index < length) {
      this.insert(array[index++]);
    }
  }

  insert(element: T): SortedArray<T> {
    const array: T[] = this.array;
    const length: number = array.length;
    const compare: IComparer<T> = this.compare;
    let index: number = length - 1;

    while (index >= 0) {
      if (compare(element, array[index]) >= 0) {
        array.splice(index + 1, 0, element);
        return this;
      }
      index--;
    }
    array.splice(0, 0, element);
    return this;
  }

  search(element: T): number {
    const array: T[] = this.array;
    const compare: IComparer<T> = this.compare;
    let low: number = 0;
    let high: number = array.length;
    if (high > 0) {
      if (array[low] === element) {
        return low;
      } else if (array[high - 1] === element) {
        return high - 1;
      }
    }
    while (high > low) {
      let index: number = (high + low) / 2 >>> 0;
      let ordering: number = compare(element, array[index]);
      if (ordering < 0) {
        high = index;
      } else if (ordering > 0) {
        low = index + 1;
      } else {
        return index;
      }
    }
    return -1;
  }

  remove(element: T): boolean {
    const index = this.search(element);
    if (index > -1) {
      this.array.splice(index, 1);
      return true;
    }
    return false;
  }

  get length(): number {
    return this.array.length;
  }

  clear() {
    this.array = [];
  }
}
