const { Worker } = require("bullmq");
const { connection } = require("./bullmqConnection");
const { News, MediaNews } = require("../models");

// Worker to process jobs from the queue
const jobWorker = new Worker(
  "jobQueue",
  async (job) => {
    console.log(`Processing job ${job.id} with data:`, job.data);

    if (job.type === "news") {
      await News.update(
        { status: "published" },
        {
          where: {
            id: job.id,
          },
        }
      );
    } else {
      await MediaNews.update(
        { status: "published" },
        {
          where: {
            id: job.id,
          },
        }
      );
    }

    console.log(`Job ${job.id} completed`);
    return { status: "success", processedAt: new Date() };
  },
  { connection }
);

// Handle worker errors
jobWorker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});

jobWorker.on("completed", (job) => {
  console.log(`Job ${job.id} finished successfully.`);
});

module.exports = jobWorker;
