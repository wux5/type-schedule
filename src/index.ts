import { jobMan, ScheduleSpec, Job, Invocation } from "./job";

export function scheduleJob(...args: any[]): Job {
  const argsLen = args.length;
  if (argsLen < 2) {
    return null;
  }
  let name;
  if (!(typeof args[1] === 'function' || (typeof args[1] === 'object' && typeof args[1].execute === 'function'))) {
    // job can be a function or an object with execute() function
    name = (typeof args[0] === 'string' ? args[0] : null);
  }
  const sched = name ? args[1] : args[0];
  const method = name ? args[2] : args[1];
  const callback = name ? args[3] : args[2];

  const job = new Job(name, method, callback);
  if (job.schedule(sched)) {
    return job;
  }
  return null;
}

export function rescheduleJob(job: string | Job, sched: ScheduleSpec): Job {
  if (job instanceof Job) {
    if (job.reschedule(sched)) {
      return job;
    }
  } else if (typeof job === 'string') {
    if (job in jobMan.scheduledJobs && jobMan.scheduledJobs.hasOwnProperty(job)) {
      if (jobMan.scheduledJobs[job].reschedule(sched)) {
        return jobMan.scheduledJobs[job];
      }
    }
  }
  return null;
}

export function cancelJob(job: string | Job): boolean {
  if (job instanceof Job) {
    return job.cancel();
  }
  if (typeof job === 'string') {
    if (job in jobMan.scheduledJobs && jobMan.scheduledJobs.hasOwnProperty(job)) {
      return jobMan.scheduledJobs[job].cancel();
    }
  }
  return false;
}

export function runNow(job: string | Job): void {
  if (job instanceof Job) {
    job.invoke();
  } else {
    if (job in jobMan.scheduledJobs && jobMan.scheduledJobs.hasOwnProperty(job)) {
      jobMan.scheduledJobs[job].invoke();
    } else {
      throw new Error(`No job with name '${job}' scheduled.`);
    }
  }
}

export const scheduledJobs = jobMan.scheduledJobs;
export { default as Range } from './range';
export { default as RecurrenceRule } from './recurrence-rule';
export { Job, ScheduleSpec, Invocation };
