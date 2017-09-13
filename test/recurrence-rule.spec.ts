import Range from "../src/range";
import { RecurrenceRule } from "../src/recurrence-rule";
import { sandbox } from "sinon";
import { expect } from "chai";

const sinon = sandbox.create();
// 12:30:15 pm Thursday 29 April 2010 in the timezone this code is being run in
const base = new Date(2010, 3, 29, 12, 30, 15, 0);
const baseMs = base.getTime();
let clock;

describe('RecurrenceRule class', () => {
  beforeEach(() => {
    clock = sinon.useFakeTimers(baseMs);
  });
  afterEach(() => {
    sinon.restore();
  });
  describe('#isValid', () => {
    context('invalid values', () => {
      context('when month is invalid', () => {
        it('should return false', () => {
          [-1, 12].forEach(month => {
            expect(new RecurrenceRule(2017, month).isValid()).to.equal(false);
          });
        });
      });
      context('when date is invalid', () => {
        it('should return false', () => {
          [[3, 0], [3, 31], [1, 30], [2, 32]].forEach(monthDate => {
            expect(new RecurrenceRule(2017, monthDate[0], monthDate[1]).isValid()).to.equal(false);
          });
        });
      });
      context('when dayOfWeek is invalid', () => {
        it('should return false', () => {
          [-1, 7].forEach(dayOfWeek => {
            expect(new RecurrenceRule(2017, 1, 1, dayOfWeek).isValid()).to.equal(false);
          });
        });
      });
      context('when hour is invalid', () => {
        it('should return false', () => {
          [-1, 24].forEach(hour => {
            expect(new RecurrenceRule(2017, 1, 1, 1, hour).isValid()).to.equal(false);
          });
        });
      });
      context('when minute is invalid', () => {
        it('should return false', () => {
          [-1, 60].forEach(minute => {
            expect(new RecurrenceRule(2017, 1, 1, 1, 1, minute).isValid()).to.equal(false);
          });
        });
      });
      context('when second is invalid', () => {
        it('should return false', () => {
          [-1, 60].forEach(second => {
            expect(new RecurrenceRule(2017, 1, 1, 1, 1, 1, second).isValid()).to.equal(false);
          });
        });
      });
    });
    context('valid values', () => {
      context('when date is number', () => {
        it('should be a valid rule', () => {
          expect(new RecurrenceRule(2017, 1, 1).isValid()).to.equal(true);
        });
      });
      context('when date is an array of number', () => {
        expect(new RecurrenceRule(2017, 1, [1, 2, 3]).isValid()).to.equal(true);
      });
      context('when date is a range', () => {
        expect(new RecurrenceRule(2017, 1, new Range(1, 10, 2)).isValid()).to.equal(true);
      });
    });
  });
  describe('#nextInvocationDate', () => {
    it('next second', () => {
      const rule = new RecurrenceRule();
      rule.second = null;
      const next = rule.nextInvocationDate(base);
      expect(next).to.eql(new Date(2010, 3, 29, 12, 30, 16, 0));
    });
    it('next 25th second', () => {
      const rule = new RecurrenceRule();
      rule.second = 25;
      const next = rule.nextInvocationDate(base);
      expect(next).to.eql(new Date(2010, 3, 29, 12, 30, 25, 0));
    });
    it('next 5th second (minutes incremented)', () => {
      const rule = new RecurrenceRule();
      rule.second = 5;
      const next = rule.nextInvocationDate(base);
      expect(next).to.eql(new Date(2010, 3, 29, 12, 31, 5, 0));
    });
    it('next 40th minute', () => {
      const rule = new RecurrenceRule();
      rule.minute = 40;
      const next = rule.nextInvocationDate(base);
      expect(next).to.eql(new Date(2010, 3, 29, 12, 40, 0, 0));
    });
    it('next 1st minute (hours incremented)', () => {
      const rule = new RecurrenceRule();
      rule.minute = 1;
      const next = rule.nextInvocationDate(base);
      expect(next).to.eql(new Date(2010, 3, 29, 13, 1, 0, 0));
    });
    it('next 23 hour', () => {
      const rule = new RecurrenceRule();
      rule.hour = 23;
      const next = rule.nextInvocationDate(base);
      expect(next).to.eql(new Date(2010, 3, 29, 23, 0, 0, 0));
    });
    it('next 3rd hour (days incremented)', () => {
      const rule = new RecurrenceRule();
      rule.hour = 3;
      const next = rule.nextInvocationDate(base);
      expect(next).to.eql(new Date(2010, 3, 30, 3, 0, 0, 0));
    });
    it('next Friday', () => {
      const rule = new RecurrenceRule();
      rule.dayOfWeek = 5;
      const next = rule.nextInvocationDate(base);
      expect(next).to.eql(new Date(2010, 3, 30, 0, 0, 0, 0));
    });
    it('next Monday (months incremented)', () => {
      const rule = new RecurrenceRule();
      rule.dayOfWeek = 1;
      const next = rule.nextInvocationDate(base);
      expect(next).to.eql(new Date(2010, 4, 3, 0, 0, 0, 0));
    });
    it('next 30th date', () => {
      const rule = new RecurrenceRule();
      rule.date = 30;
      const next = rule.nextInvocationDate(base);
      expect(next).to.eql(new Date(2010, 3, 30, 0, 0, 0, 0));
    });
    it('next 5th date (months incremented)', () => {
      const rule = new RecurrenceRule();
      rule.date = 5;
      const next = rule.nextInvocationDate(base);
      expect(next).to.eql(new Date(2010, 4, 5, 0, 0, 0, 0));
    });
    it('next October', () => {
      const rule = new RecurrenceRule();
      rule.month = 9;
      const next = rule.nextInvocationDate(base);
      expect(next).to.eql(new Date(2010, 9, 1, 0, 0, 0, 0));
    });
    it('next February (years incremented)', () => {
      const rule = new RecurrenceRule();
      rule.month = 1;
      const next = rule.nextInvocationDate(base);
      expect(next).to.eql(new Date(2011, 1, 1, 0, 0, 0, 0));
    });
    it('in the year 2040', () => {
      const rule = new RecurrenceRule();
      rule.year = 2040;
      const next = rule.nextInvocationDate(base);
      expect(next).to.eql(new Date(2040, 0, 1, 0, 0, 0, 0));
    });
    it('using mixed time components', () => {
      const rule = new RecurrenceRule();
      rule.second = 50;
      rule.minute = 5;
      rule.hour = 10;
      const next = rule.nextInvocationDate(base);
      expect(next).to.eql(new Date(2010, 3, 30, 10, 5, 50, 0));
    });
    it('returns null when no invocations left', () => {
      const rule = new RecurrenceRule();
      rule.year = 2000;
      const next = rule.nextInvocationDate(base);
      expect(next).to.eql(null);
    });
    it('specify span of components using Range', () => {
      const rule = new RecurrenceRule();
      rule.minute = new Range(4, 6);
      let next = rule.nextInvocationDate(base);
      expect(next).to.eql(new Date(2010, 3, 29, 13, 4, 0, 0));
      next = rule.nextInvocationDate(next);
      expect(next).to.eql(new Date(2010, 3, 29, 13, 5, 0, 0));
      next = rule.nextInvocationDate(next);
      expect(next).to.eql(new Date(2010, 3, 29, 13, 6, 0, 0));
      next = rule.nextInvocationDate(next);
      expect(next).to.eql(new Date(2010, 3, 29, 14, 4, 0, 0));
    });
    it('specify intervals within span of components using Range with step', () => {
      const rule = new RecurrenceRule();
      rule.minute = new Range(4, 8, 2);
      let next = rule.nextInvocationDate(base);
      expect(next).to.eql(new Date(2010, 3, 29, 13, 4, 0, 0));
      next = rule.nextInvocationDate(next);
      expect(next).to.eql(new Date(2010, 3, 29, 13, 6, 0, 0));
      // Should Range stay inclusive on both ends when step > 1 ?
      next = rule.nextInvocationDate(next);
      expect(next).to.eql(new Date(2010, 3, 29, 14, 4, 0, 0));
    });
    it('specify span and explicit components using Array of Ranges and Numbers', () => {
      const rule = new RecurrenceRule();
      rule.minute = [2, new Range(4, 6)];
      let next = rule.nextInvocationDate(base);
      expect(next).to.eql(new Date(2010, 3, 29, 13, 2, 0, 0));
      next = rule.nextInvocationDate(next);
      expect(next).to.eql(new Date(2010, 3, 29, 13, 4, 0, 0));
      next = rule.nextInvocationDate(next);
      expect(next).to.eql(new Date(2010, 3, 29, 13, 5, 0, 0));
      next = rule.nextInvocationDate(next);
      expect(next).to.eql(new Date(2010, 3, 29, 13, 6, 0, 0));
      next = rule.nextInvocationDate(next);
      expect(next).to.eql(new Date(2010, 3, 29, 14, 2, 0, 0));
    });
    it('From 31th May schedule the 1st of every June', () => {
      const rule = new RecurrenceRule();
      rule.second = 0;
      rule.minute = 0;
      rule.hour = 0;
      rule.date = 1;
      rule.month = 5;

      const base = new Date(2010, 4, 31, 12, 30, 15, 0);
      let next = rule.nextInvocationDate(base);
      expect(next).to.eql(new Date(2010, 5, 1, 0, 0, 0, 0));
      next = rule.nextInvocationDate(next);
      expect(next).to.eql(new Date(2011, 5, 1, 0, 0, 0, 0));
    });
    it('With the year set should not loop indefinetely', () => {
      const rule = new RecurrenceRule();
      rule.second = 0;
      rule.minute = 0;
      rule.hour = 0;
      rule.date = 1;
      rule.month = 5;
      rule.year = 2010;
      const base = new Date(2010, 4, 31, 12, 30, 15, 0);
      let next = rule.nextInvocationDate(base);
      expect(next).to.eql(new Date(2010, 5, 1, 0, 0, 0, 0));
      next = rule.nextInvocationDate(next);
      expect(next).to.eql(null);
    });
    it('using rule with string properties', () => {
      const rule = new RecurrenceRule();
      rule.second = '50';
      rule.minute = '5';
      rule.hour = '10';
      let next = rule.nextInvocationDate(base);
      expect(next).to.eql(new Date(2010, 3, 30, 10, 5, 50, 0));
    });
    it('should return null on an invalid month', () => {
      const rule = new RecurrenceRule();
      rule.month = 12;
      let next = rule.nextInvocationDate();
      expect(next).to.eql(null);
      const rule2 = new RecurrenceRule();
      rule2.month = 'invalid-value';
      let next2 = rule2.nextInvocationDate(next);
      expect(next2).to.eql(null);
    });
    it('should return null on an invalid second', () => {
      const rule = new RecurrenceRule();
      rule.second = 60;
      let next = rule.nextInvocationDate();
      expect(next).to.eql(null);
      const rule2 = new RecurrenceRule();
      rule2.second = 'invalid-value';
      let next2 = rule2.nextInvocationDate(next);
      expect(next2).to.eql(null);
    });
    it('should return null on an invalid hour', () => {
      const rule = new RecurrenceRule();
      rule.hour = 24;
      let next = rule.nextInvocationDate();
      expect(next).to.eql(null);
      const rule2 = new RecurrenceRule();
      rule2.hour = 'invalid-value';
      let next2 = rule2.nextInvocationDate(next);
      expect(next2).to.eql(null);
    });
    it('should return null on an invalid date', () => {
      const rule = new RecurrenceRule();
      rule.date = 90;
      let next = rule.nextInvocationDate();
      expect(next).to.eql(null);
      const rule2 = new RecurrenceRule();
      rule2.date = 'invalid-value';
      let next2 = rule2.nextInvocationDate(next);
      expect(next2).to.eql(null);
      const rule3 = new RecurrenceRule();
      rule3.month = 1; // Test Februry has only 29 days
      rule3.date = 30;
      let next3 = rule3.nextInvocationDate();
      expect(next3).to.eql(null);
    });
    it('should return null on an invalid dayOfWeek', () => {
      const rule = new RecurrenceRule();
      rule.dayOfWeek = 9;
      let next = rule.nextInvocationDate();
      expect(next).to.eql(null);
      const rule2 = new RecurrenceRule();
      rule2.dayOfWeek = 'invalid-value';
      let next2 = rule2.nextInvocationDate(next);
      expect(next2).to.eql(null);
    });
  });
});
