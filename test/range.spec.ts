import Range from '../src/range';
import { expect } from 'chai';

describe('Range class', () => {
  describe('constructor', () => {
    it('should create a range instance with defaults', () => {
      let range: Range = new Range();
      expect(range.start).to.eql(0);
      expect(range.end).to.eql(60);
      expect(range.step).to.eql(1);
    });
  });
  describe('.contains', () => {
    context('when step is 1', () => {
      let range: Range;
      beforeEach(() => {
        range = new Range(2, 6, 1);
      });
      it('should include start value', () => {
        expect(range.contains(2)).to.equal(true);
      });
      it('should include end value', () => {
        expect(range.contains(6)).to.equal(true);
      });
      it('should include value between start and end', () => {
        expect(range.contains(3)).to.equal(true);
      });
      it('should exclude values outside of start and end', () => {
        expect(range.contains(1)).to.equal(false);
        expect(range.contains(7)).to.equal(false);
      });
    });
    context('when step > 1', () => {
      let range: Range;
      beforeEach(() => {
        range = new Range(2, 6, 2);
      });
      it('should include start value', () => {
        expect(range.contains(2)).to.equal(true);
      });
      it('should exclude end value', () => {
        expect(range.contains(6)).to.equal(false);
      });
      it('should include value between start and end that is evenly divisible by step', () => {
        expect(range.contains(4)).to.equal(true);
      });
      it('should exclude value between start and end that is not evenly divisible by step', () => {
        expect(range.contains(5)).to.equal(false);
      });
      it('should exclude values outside of start and end', () => {
        expect(range.contains(1)).to.equal(false);
        expect(range.contains(7)).to.equal(false);
      });
    });
  });
});
