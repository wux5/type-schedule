import { Job } from "./schedule";

const job = new Job('test-fun', function () {
  console.log(this.name, new Date());
}, null);

job.start();
