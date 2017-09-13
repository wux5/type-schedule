import * as cronParser from 'cron-parser';
import * as CronDate from 'cron-parser/lib/date';
import * as lt from 'long-timeout';
import { EventEmitter } from "events";
import { IComparer, SortedArray } from './sorted-array';

export let anonJobCounter: number;
// export const scheduledJobs: Array<Job> = [];

function isValidDate(date: CronDate): boolean {
  return !isNaN(date.getTime());
}


// export class Invocation {
//   job: Job;
//   fireDate: CronDate;
//   endDate?: CronDate;
//   recurrenceRule: RecurrenceRule;
// }

// export class Job extends EventEmitter {
//   name: string;
//   private job: Function;
//   private callback: Function;
//   // private pendingInvocation: Invocation[];

//   constructor(name: string, job: Function, callback: Function) {
//     super();
//     this.name = name;
//     this.job = job;
//     this.callback = callback;

//     // this.pendingInvocation = [];
//   }

//   start() {
//     setInterval(this.job.bind(this), 1000);
//   }
// }

