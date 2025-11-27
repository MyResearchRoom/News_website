const cron = require("node-cron");
const { Op } = require("sequelize");
const { News, MediaNews } = require("../models");
const moment = require("moment-timezone");

cron.schedule("* * * * *", async () => {
  const now = moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:MM:SS");

  console.log("⏰ Checking for scheduled news...", now);

  try {
    const newsToPublish = await News.findAll({
      where: {
        status: "scheduled",
        publishedAt: { [Op.lte]: now },
      },
    });

    for (const news of newsToPublish) {
      await news.update({ status: "published" });
      console.log(`✅ Published scheduled News: ${news.title}`);
    }

    const mediaToPublish = await MediaNews.findAll({
      where: {
        status: "scheduled",
        publishedAt: { [Op.lte]: now },
      },
    });

    for (const media of mediaToPublish) {
      await media.update({ status: "published" });
      console.log(`✅ Published scheduled MediaNews: ${media.title}`);
    }
  } catch (err) {
    console.error("❌ Error while publishing scheduled news:", err);
  }
});
