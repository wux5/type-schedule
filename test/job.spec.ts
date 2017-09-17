import { expect } from "chai";
import { jobMan, Job, scheduledJobs, ScheduleObject } from "../src/job";
import RecurrenceRule from "../src/recurrence-rule";
import { sandbox } from "sinon";
import * as moment from "moment";

const sinon = sandbox.create();

describe('Job class', () => {
  let clock;
  beforeEach(() => {
    clock = sinon.useFakeTimers(new Date('2010-01-01').getTime());
  });
  afterEach(() => {
    sinon.restore();
  });
  describe('constructor', () => {
    it('should create a Job instance with specified name', () => {
      const job = new Job('test-job');
      expect(job.name).to.equal('test-job');
    });
    it('should create a job instance with anonymous name when no name is supplied', () => {
      const job = new Job();
      expect(job.name.indexOf('<Anonymous Job')).to.equal(0);
    });
  });
  describe('#invoke', () => {
    context('when job is a function', () => {
      it('should call the function', () => {
        const spy = sinon.spy();
        const job = new Job(null, spy);
        job.invoke();
        expect(spy.callCount).to.equal(1);
      });
      it('should call callback if specified', () => {
        const spy = sinon.spy();
        const job = new Job(null, spy, spy);
        job.invoke();
        expect(spy.callCount).to.equal(2);
      });
      it('should emit run event', done => {
        const spy = sinon.spy();
        const job = new Job(null, spy, spy);
        job.on('run', () => {
          done();
        });
        job.invoke();
      });
      it('should increase job counter properly', () => {
        const job = new Job(null, () => { });
        job.invoke();
        expect(job.triggeredJobs).to.equal(1);
        job.invoke();
        expect(job.triggeredJobs).to.equal(2);
      });
    });
    context('when job is an object', () => {
      it('should call the .execute() function in the object', () => {
        const obj = {
          execute: function () { }
        };
        const spy = sinon.spy(obj, 'execute');
        const job = new Job(null, obj);
        job.invoke();
        expect(spy.calledOnce).to.equal(true);
      });
    });
  });
  describe('#schedule', () => {
    it('should throw exception if a job with the same name is already scheduled', () => {
      const job = new Job('test-job', () => { });
      job.schedule(moment().add(1, 'day').toDate());
      expect(() => {
        job.schedule(moment().add(1, 'day').toDate());
      }).to.throw();
      job.cancel();
    });
    context('when schedule with Date', () => {
      it('should run job once at specified date', done => {
        const spy = sinon.spy();
        const job = new Job(null, spy);
        job.schedule(new Date(Date.now() + 3000));
        setTimeout(() => {
          job.cancel();
          expect(spy.callCount).to.equal(1);
          done();
        }, 3250);
        clock.tick(3250);
      });
      it('should not run job if scheduled in the past', done => {
        const spy = sinon.spy();
        const job = new Job(null, spy);
        job.schedule(new Date(Date.now() - 3000));
        setTimeout(() => {
          job.cancel();
          expect(spy.callCount).to.equal(0);
          done();
        }, 3250);
        clock.tick(3250);
      });
    });
    context('when schedule with a date string or integer value', () => {
      it('should run job once at specified date', done => {
        const spy = sinon.spy();
        const job = new Job(null, spy);
        job.schedule(new Date(Date.now() + 2000).toString());
        setTimeout(() => {
          job.cancel();
          expect(spy.callCount).to.equal(1);
          done();
        }, 3250);
        clock.tick(3250);
      });
    });
    context('when schedule with a RecurrentRule', () => {
      context('when rule recurs is true', () => {
        it('should run job at interval based on recur rule, repeating indefinitely', done => {
          const spy = sinon.spy();
          const job = new Job(null, spy);
          const rule = new RecurrenceRule(); // fire every second
          rule.second = null;
          job.schedule(rule);
          setTimeout(() => {
            job.cancel();
            expect(spy.callCount).to.equal(3);
            done();
          }, 3250);
          clock.tick(3250);
        });
        it('should not invoke a job if recur rule schedules it in the past', done => {
          const spy = sinon.spy();
          const job = new Job(null, spy);
          const rule = new RecurrenceRule(); // fire every second
          rule.year = 2000;
          job.schedule(rule);
          setTimeout(() => {
            job.cancel();
            expect(spy.callCount).to.equal(0);
            done();
          }, 1000);
          clock.tick(1000);
        });
        it('should emit scheduled event for every net invocation', done => {
          const spy = sinon.spy();
          const job = new Job(null, () => { });
          job.on('scheduled', date => {
            spy();
          });
          job.schedule('*/1 * * * * *');
          setTimeout(() => {
            job.cancel();
            expect(spy.callCount).to.equal(4);
            done();
          }, 3250);
          clock.tick(3250);
        });
      });
      context('when rule recurs is false', () => {
        it('should not run any job', done => {
          const spy = sinon.spy();
          const job = new Job(null, spy);
          const rule = new RecurrenceRule(); // fire every second
          rule.second = null;
          rule.recurs = false;
          job.schedule(rule);
          setTimeout(() => {
            job.cancel();
            expect(spy.callCount).to.equal(0);
            done();
          }, 3250);
          clock.tick(3250);
        });
      });
    });
    context('when schedule with a cron string', () => {
      it('should run job according to the cron', done => {
        const spy = sinon.spy();
        const job = new Job(null, spy);
        job.schedule('*/1 * * * * *'); // every second
        setTimeout(() => {
          job.cancel();
          expect(spy.callCount).to.equal(3);
          done();
        }, 3250);
        clock.tick(3250);
      });
    });
    context('when schedule with a ScheduleObject', () => {
      context('when startDate is specified', () => {
        context('when endDate is not specified', () => {
          context('when schedule.rule is cron string', () => {
            it('should run job after startDate', done => {
              const spy = sinon.spy();
              const job = new Job(null, spy);
              const sched = new ScheduleObject(
                moment().add(1, 'second').toDate(),
                null,
                '*/1 * * * * *'
              );
              job.schedule(sched);
              setTimeout(() => {
                job.cancel();
                expect(spy.callCount).to.equal(2);
                done();
              }, 3250);
              clock.tick(3250);
            });
          });
          context('when schedule.rule is RecurrenceRule', () => {
            it('should run job after startDate', done => {
              const spy = sinon.spy();
              const job = new Job(null, spy);
              const rule = new RecurrenceRule();
              rule.second = null;
              const sched = new ScheduleObject(
                moment().add(1, 'second').toDate(),
                null,
                rule
              );
              job.schedule(sched);
              setTimeout(() => {
                job.cancel();
                expect(spy.callCount).to.equal(2);
                done();
              }, 3250);
              clock.tick(3250);
            });
          });
        });
        context('when endDate is specified', () => {
          it('should run jobs between startDate and endDate', done => {
            const spy = sinon.spy();
            const job = new Job(null, spy);
            const sched = new ScheduleObject(
              moment().add(1, 'second').toDate(),
              moment().add(2, 'seconds').toDate(),
              '*/1 * * * * *'
            );
            job.schedule(sched);
            setTimeout(() => {
              job.cancel();
              expect(spy.callCount).to.equal(1);
              done();
            }, 3250);
            clock.tick(3250);
          });
        });
      });
      context('when startDate is not specified and endDate is specified', () => {
        it('should run jobs before endDate', done => {
          const spy = sinon.spy();
          const job = new Job(null, spy);
          const sched = new ScheduleObject(
            null,
            moment().add(2, 'seconds').toDate(),
            '*/1 * * * * *'
          );
          job.schedule(sched);
          setTimeout(() => {
            job.cancel();
            expect(spy.callCount).to.equal(2);
            done();
          }, 3250);
          clock.tick(3250);
        });
      });
    });
  });
  describe('#cancel', () => {
    it('should prevent all future invocations', done => {
      const spy = sinon.spy();
      const job = new Job(null, spy);
      job.schedule('*/1 * * * * *');
      setTimeout(() => {
        job.cancel();
      }, 1250);
      setTimeout(() => {
        job.cancel();
        expect(spy.callCount).to.equal(1);
        done();
      }, 3250);
      clock.tick(3250);
    });
    it('should emit canceled event', done => {
      const spy = sinon.spy();
      const job = new Job(null, spy);
      job.schedule('*/1 * * * * *');
      job.on('canceled', () => {
        done();
      });
      setTimeout(() => {
        job.cancel();
      }, 1250);
      clock.tick(2250);
    });
    it('should add job to scheduledJobs when scheduled and removed when canceled', done => {
      const job1 = new Job('cancelJob', () => { });
      job1.schedule('*/1 * * * * *');
      const job2 = new Job('second', () => { }, () => { });
      job2.schedule('*/1 * * * * *');
      expect(jobMan.scheduledJobs['cancelJob']).to.not.equal(undefined);
      expect(jobMan.scheduledJobs['second']).to.not.equal(undefined);
      setTimeout(() => {
        job1.cancel();
        job2.cancel();
        expect(jobMan.scheduledJobs['cancelJob']).to.equal(undefined);
        expect(jobMan.scheduledJobs['second']).to.equal(undefined);
        done();
      }, 1250);
      clock.tick(1250);
    });
  });
  describe('#reschedule', () => {
    it('should reschedule the job', done => {
      const spy = sinon.spy();
      const job = new Job(null, spy);
      job.schedule('*/1 * * * * *'); // every second
      setTimeout(() => {
        job.reschedule('*/1 * * * *'); // every minute
      }, 2250);
      setTimeout(() => {
        job.cancel();
        expect(spy.callCount).to.equal(4);
        done();
      }, 3 * 60 * 1000);
      clock.tick(3 * 60 * 1000);
    });
    it('should reset triggered count to 0', done => {
      const spy = sinon.spy();
      const job = new Job(null, spy);
      job.schedule('*/1 * * * * *'); // every second
      setTimeout(() => {
        expect(job.triggeredJobs).to.equal(3);
        job.reschedule('*/3 * * * * *');
        expect(job.triggeredJobs).to.equal(0);
        job.cancel();
        done();
      }, 3250);
      clock.tick(3250);
    });
    it('should not lose the pending invocations if reschedule fails', done => {
      const job = new Job(null, () => { });
      job.schedule('*/1 * * * * *'); // every second
      setTimeout(() => {
        const stub = sinon.stub(job, 'schedule').returns(false);
        const cInvs = job.pendingInvocations;
        job.reschedule('*/2 * * * * *');
        expect(job.pendingInvocations).to.eql(cInvs);
        job.cancel();
        done();
      }, 1250);
      clock.tick(1250);
    });
  });
  describe('#nextInvocation', () => {
    context('when pending invocations exist', () => {
      it('should return firedate of next invocation', () => {
        const job = new Job(null, () => { });
        job.schedule('*/1 * * * * *'); // every second
        expect(job.nextInvocation).to.be.an('object');
        job.cancel();
      });
    });
    context('when pending invocations is empty', () => {
      it('should return null', () => {
        const job = new Job(null, () => { });
        job.schedule('2000-1-1'); // a past date
        expect(job.nextInvocation).to.equal(null);
        job.cancel();
      });
    });
  });
});
