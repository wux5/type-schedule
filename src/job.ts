import * as CronDate from 'cron-parser/lib/date';
import * as cronParser from "cron-parser";
import * as lt from "long-timeout";
import * as util from "./util";
import RecurrenceRule from "./recurrence-rule";
import { EventEmitter } from "events";
import SortedArray from "./sorted-array";

export type InvocationArray = SortedArray<Invocation>;
/**
 * Sorter function to sort scheduled invocations by date/time
 * 
 * @param {Invocation} a - invocation
 * @param {Invocation} b - another invocation
 * @returns {number} - difference between the fire date of 2 invocations
 */
function invocationSorter(a: Invocation, b: Invocation): number {
  return a.fireDate.getTime() - b.fireDate.getTime();
}

/**
 * Singleton Job Manager class that manage job invocations
 */
export class JobManager {
  private static _instance: JobManager;
  // anonymous job counter
  anonJobCounter = 0;
  // active invocations of all jobs
  invocations: InvocationArray = new SortedArray<Invocation>([], invocationSorter);
  // current invocation
  currentInvocation: Invocation = null;
  // scheduled jobs
  scheduledJobs: Object = {};

  static get instance(): JobManager {
    return this._instance || (this._instance = new this());
  }

  cancelInvocation(invocation: Invocation) {
    if (this.invocations.remove(invocation)) {
      if (invocation.timerID !== null) {
        lt.clearTimeout(invocation.timerID);
      }

      if (this.currentInvocation === invocation) {
        this.currentInvocation = null;
      }

      invocation.job.emit('canceled', invocation.fireDate);

      this.prepareNextInvocation();
    }
  }

  scheduleInvocation(invocation: Invocation): void {
    this.invocations.insert(invocation);
    this.prepareNextInvocation();
    const date = invocation.fireDate instanceof CronDate ? invocation.fireDate.toDate() : invocation.fireDate;
    invocation.job.emit('scheduled', date);
  }

  prepareNextInvocation(): void {
    if (this.invocations.length > 0 && this.currentInvocation !== this.invocations.array[0]) {
      if (this.currentInvocation !== null) {
        lt.clearTimeout(this.currentInvocation.timerID);
        this.currentInvocation.timerID = null;
        this.currentInvocation = null;
      }
      this.currentInvocation = this.invocations.array[0];
      const job = this.currentInvocation.job;
      const cinv = this.currentInvocation;
      this.currentInvocation.timerID = this.runOnDate(this.currentInvocation.fireDate, function () {
        this.currentInvocationFinished();

        const rule = cinv.recurrenceRule;
        if (rule && (rule.recurs || rule._endDate === null)) {
          // rule: RecurrenceRule, job: Job, fireDate: CronDate, endDate: CronDate
          const inv = this.scheduleNextRecurrence(cinv.recurrenceRule, job, cinv.fireDate, cinv.endDate);
          if (inv !== null) {
            inv.job.trackInvocation(inv);
          }
        }
        job.stopTrackingInvocation(cinv);

        job.invoke();
      }.bind(this));
    }
  }

  currentInvocationFinished(): void {
    this.invocations.array.shift();
    this.currentInvocation = null;
    this.prepareNextInvocation();
  }

  runOnDate(date: Date, job: Function): NodeJS.Timer {
    const now = Date.now();
    const then = date.getTime();
    return lt.setTimeout(job, then < now ? 0 : then - now);
  }

  scheduleNextRecurrence(rule: RecurrenceRule | any, job: Job, prevDate: Date, endDate: Date): Invocation {
    prevDate = prevDate || new Date();

    const date = rule instanceof RecurrenceRule ? rule.nextInvocationDate(prevDate) : rule.next();
    if (date === null) {
      return null;
    }

    if (endDate instanceof Date && date.getTime() > endDate.getTime()) {
      return null;
    }

    const inv = new Invocation(job, date, rule, endDate);
    this.scheduleInvocation(inv);

    return inv;
  }
}

export const jobMan = JobManager.instance;
export const scheduledJobs = jobMan.scheduledJobs;
export class Invocation {
  job: Job;
  fireDate: Date | CronDate;
  endDate?: Date | CronDate;
  recurrenceRule: RecurrenceRule | any;
  timerID: NodeJS.Timer = null;
  constructor(job: Job, fireDate?: Date, rule?: RecurrenceRule | any, endDate?: Date) {
    this.job = job;
    this.fireDate = fireDate;
    this.endDate = endDate;
    this.recurrenceRule = rule;
  }
}
export interface IJobObject {
  execute(): void;
}
export class ScheduleObject {
  start?: Date;
  end?: Date;
  rule?: string | RecurrenceRule; // cron or rec rule
  constructor(start?: Date, end?: Date, rule?: string | RecurrenceRule) {
    this.start = start;
    this.end = end;
    this.rule = rule;
  }
}
// Date - a specific date in Date object
// string - can be either a Date string, or a cron string
// number - the int value of a date, will be parsed into Date
// RecurrenceRule - recurrence rule
// ScheduleObject - an object with start, end and
//   either the rule in RecurrenceRule, or
//   a cron string
export type ScheduleSpec = Date | string | number | RecurrenceRule | ScheduleObject;

export class Job extends EventEmitter {
  private _name: string;
  get name() {
    return this._name;
  }

  private _pendingInvocations: InvocationArray = new SortedArray<Invocation>([], invocationSorter);
  get pendingInvocations(): InvocationArray {
    return this._pendingInvocations;
  }

  private _triggeredJobs: number = 0;
  get triggeredJobs() {
    return this._triggeredJobs;
  }

  resetTriggeredJobs(): void {
    this._triggeredJobs = 0;
  }
  addTriggeredJobs(): number {
    return ++this._triggeredJobs;
  }

  job: Function | IJobObject;
  callback: Function;

  constructor(name?: string, job?: Function | IJobObject, callback?: Function) {
    super();

    this._name = name || `<Anonymous Job ${++jobMan.anonJobCounter}>`;
    this.job = job;
    this.callback = callback;
  }

  trackInvocation(invocation: Invocation): boolean {
    this.pendingInvocations.insert(invocation);
    return true;
  }

  stopTrackingInvocation(invocation: Invocation): boolean {
    return this.pendingInvocations.remove(invocation);
  }

  invoke() {
    if (typeof this.job === 'function') {
      this.addTriggeredJobs();
      this.job();
    } else {
      this.job.execute();
    }
    if (this.callback) {
      this.callback();
    }
    this.emit('run');
  }

  schedule(sched: ScheduleSpec): boolean {
    if (jobMan.scheduledJobs[this.name]) {
      throw new Error(`A job with the name ${this.name} is already scheduled, please either reschedule it, or cancel and then schedule it again.`);
    }
    let success = false;
    let inv: Invocation;
    let start: CronDate;
    let end: CronDate;
    let recRule: RecurrenceRule | any;
    let fireDate: Date;
    let type = typeof sched;

    if (sched instanceof RecurrenceRule) {
      recRule = sched;
    } else if (sched instanceof ScheduleObject) {
      start = sched.start || undefined; // CronDate need undefined instead of null
      end = sched.end || undefined;
      if (sched.rule instanceof RecurrenceRule) {
        recRule = sched.rule;
      } else {
        recRule = util.parseCron(sched.rule, { currentDate: start });
      }
    } else if (type === 'string') {
      recRule = util.parseCron(String(sched), {});
    }
    if (recRule) {
      // cron or recurrence rule
      inv = jobMan.scheduleNextRecurrence(recRule, this, start, end);
      if (inv !== null) {
        success = this.trackInvocation(inv);
      }
    } else if (type === 'string' || type === 'number') {
      // 'Thu Sep 14 2017 11:50:27 GMT-0700 (PDT)' or 1505427200476
      fireDate = new Date(sched);
    } else if (sched instanceof Date) {
      // Date object
      fireDate = sched;
    }
    if (util.isValidDate(fireDate)) {
      if (fireDate.getTime() >= Date.now()) {
        inv = new Invocation(this, fireDate);
        jobMan.scheduleInvocation(inv);
        success = this.trackInvocation(inv);
      }
    }

    if (success) {
      jobMan.scheduledJobs[this.name] = this;
    }
    return success;
  }

  cancel(): boolean {
    let inv: Invocation, newInv: Invocation;
    for (let j = 0; j < this.pendingInvocations.length; j++) {
      inv = this.pendingInvocations.array[j];
      jobMan.cancelInvocation(inv);
    }

    this.pendingInvocations.clear();
    delete jobMan.scheduledJobs[this.name];

    return true;
  }

  reschedule(sched: ScheduleSpec): boolean {
    const cInvs = this.pendingInvocations.array.slice();
    this.cancel();
    if (this.schedule(sched)) {
      this.resetTriggeredJobs();
    } else {
      this.pendingInvocations.array = cInvs;
      return false;
    }
    return true;
  }

  get nextInvocation(): Date {
    return this.pendingInvocations.length > 0 ? this.pendingInvocations.array[0].fireDate : null;
  }
}
