import * as schedule from '../src/schedule';
import { sandbox } from 'sinon';
import { expect } from "chai";

const sinon = sandbox.create();

describe('schedule', () => {
  let clock;
  let spy;
  beforeEach(() => {
    clock = sinon.useFakeTimers(new Date('2010-01-01').getTime());
    spy = sinon.spy();
  });
  afterEach(() => {
    sinon.restore();
  });
  describe('.scheduleJob', () => {
    context('when name is not specified', () => {
      it('should schedule an anonymous job', done => {
        const job = schedule.scheduleJob('*/1 * * * * *', spy);
        expect(job.name).to.include('<Anonymous');
        setTimeout(function () {
          expect(spy.callCount).to.equal(3);
          job.cancel();
          done();
        }, 3250);
        clock.tick(3250);
      });
      it('should call callback if specified', done => {
        const job = schedule.scheduleJob('*/1 * * * * *', () => { }, spy);
        expect(job.name).to.include('<Anonymous');
        setTimeout(function () {
          expect(spy.callCount).to.equal(3);
          job.cancel();
          done();
        }, 3250);
        clock.tick(3250);
      });
    });
    context('when name is specified', () => {
      it('should schedule the job of function type with specified name', done => {
        const job = schedule.scheduleJob('test-job', '*/1 * * * * *', spy);
        expect(job.name).to.equal('test-job');
        setTimeout(function () {
          expect(spy.callCount).to.equal(3);
          job.cancel();
          done();
        }, 3250);
        clock.tick(3250);
      });
      it('should schedule the job of object type with specified name', done => {
        const jobObj = {
          execute: spy
        };
        const job = schedule.scheduleJob('test-job', '*/1 * * * * *', jobObj);
        expect(job.name).to.equal('test-job');
        setTimeout(function () {
          expect(spy.callCount).to.equal(3);
          job.cancel();
          done();
        }, 3250);
        clock.tick(3250);
      });
      it('should call callback if specified', done => {
        const job = schedule.scheduleJob('test-job', '*/1 * * * * *', () => { }, spy);
        expect(job.name).to.equal('test-job');
        setTimeout(function () {
          expect(spy.callCount).to.equal(3);
          job.cancel();
          done();
        }, 3250);
        clock.tick(3250);
      });
    });
  });
  describe('.rescheduleJob', () => {
    it('should reschedule the job by name', done => {
      const job = schedule.scheduleJob('test-job', '*/1 * * * * *', spy); // every second
      setTimeout(() => {
        expect(spy.callCount).to.equal(1);
        schedule.rescheduleJob('test-job', '*/1 * * * *'); // every minute
        setTimeout(() => {
          expect(spy.callCount).to.equal(3);
          job.cancel();
          done();
        }, 2 * 60 * 1000);
        clock.tick(2 * 60 * 1000);
      }, 1250);
      clock.tick(1250);
    });
    it('should reschedule job by object', done => {
      const job = schedule.scheduleJob('*/1 * * * * *', spy); // every second
      setTimeout(() => {
        expect(spy.callCount).to.equal(1);
        schedule.rescheduleJob(job, '*/1 * * * *'); // every minute
        setTimeout(() => {
          expect(spy.callCount).to.equal(3);
          job.cancel();
          done();
        }, 2 * 60 * 1000);
        clock.tick(2 * 60 * 1000);
      }, 1250);
      clock.tick(1250);
    });
  });
  describe('.cancelJob', () => {
    it('should cancel job by name', done => {
      const job = schedule.scheduleJob('test-job', '*/1 * * * * *', spy); // every second
      setTimeout(() => {
        schedule.cancelJob('test-job');
      }, 1250);
      setTimeout(() => {
        expect(spy.callCount).to.equal(1);
        done();
      }, 3250);
      clock.tick(3250);
    });
    it('should cancel job by object', done => {
      const job = schedule.scheduleJob('*/1 * * * * *', spy); // every second
      setTimeout(() => {
        schedule.cancelJob(job);
      }, 1250);
      setTimeout(() => {
        expect(spy.callCount).to.equal(1);
        done();
      }, 3250);
      clock.tick(3250);
    });
  });
});
