import SortedArray from "../src/sorted-array";
import { expect } from "chai";

describe('SortedArray class', () => {
  describe('constructor, .insert', () => {
    context('when compare function is not supplied', () => {
      it('should create an instance with the default compare', () => {
        const array = new SortedArray([2, 1, 3, 5, 4, 3]);
        expect(array.array).to.eql([1, 2, 3, 3, 4, 5]);
      });
    });
    context('when compare function is supplied', () => {
      it('should create an instance using the supplied compare function', () => {
        const compare = function <T>(a: T, b: T): number {
          if (a === b) {
            return 0;
          }
          return a < b ? 1 : -1;
        };
        const array = new SortedArray([2, 1, 3, 5, 4, 3], compare);
        expect(array.array).to.eql([5, 4, 3, 3, 2, 1]);
      });
    });
  });
  describe('.search', () => {
    context('when the element is found', () => {
      it('should return the index', () => {
        const array = new SortedArray([1, 2, 3, 4, 5]);
        for (let i = 0; i < 5; i++) {
          expect(array.search(i + 1)).to.eql(i);
        }
      });
    });
    context('when the element is not found', () => {
      it('should return the -1', () => {
        let array = new SortedArray([1, 2, 3, 4, 5]);
        expect(array.search(0)).to.eql(-1);
        expect(array.search(6)).to.eql(-1);
        array = new SortedArray([]);
        expect(array.search(1)).to.eql(-1);
      });
    });
  });
  describe('.remove', () => {
    context('when the element is found', () => {
      it('should remove the element', () => {
        const array = new SortedArray([1, 2, 3, 4, 5]);
        array.remove(1);
        expect(array.array).to.eql([2, 3, 4, 5]);
        array.remove(5);
        expect(array.array).to.eql([2, 3, 4]);
        array.remove(3);
        expect(array.array).to.eql([2, 4]);
      });
    });
    context('when the element is not found', () => {
      it('should not change the array', () => {
        const array = new SortedArray([1, 2, 3, 4, 5]);
        array.remove(6);
        expect(array.array).to.eql([1, 2, 3, 4, 5]);
      });
    });
  });
  describe('.length', () => {
    it('should return the length of the array', () => {
      const array = new SortedArray([1, 2, 3, 4, 5]);
      expect(array.length).to.equal(5);
    });
  });
  describe('.clear', () => {
    it('should empty the array', () => {
      const array = new SortedArray([1, 2, 3, 4, 5]);
      array.clear();
      expect(array.length).to.equal(0);
    });
  });
});
