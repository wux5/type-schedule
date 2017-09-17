import { jobMan, ScheduleSpec, Job } from "./job";

export function scheduleJob(...args: any[]): Job {
  if (args.length < 2) {
    return null;
  }
  const name = (args.length >= 3 && typeof args[0] === 'string') ? args[0] : null;
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

export const scheduledJobs = jobMan.scheduledJobs;
export { default as Range } from './range';
export { RecurrenceRule } from './recurrence-rule';
export { Invocation, ScheduleSpec, Job } from './job';
