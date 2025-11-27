const { Queue } = require("bullmq");
const { connection } = require("./bullmqConnection");

const jobQueue = new Queue("jobQueue", { connection });

module.exports = jobQueue;
