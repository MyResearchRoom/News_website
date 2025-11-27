const expres = require("express");
const router = expres.Router();

const userRoutes = require("./user.routes");
const categoryRoutes = require("./category.routes");
const newsRoutes = require("./news.routes");
const mediaNewsRoutes = require("./mediaNews.routes");
const siteDataRoutes = require("./siteData.routes");
const newsCommentRoutes = require("./newsComment.routes");
const mediaNewsCommentRoutes = require("./mediaNewsComment.routes");
const advertiseRoutes=require("./ad.routes")
router.use("/test", (req, res) =>
  res.send("<h1>Hello, This is a test route</h1>")
);

router.use("/users", userRoutes);
router.use("/categories", categoryRoutes);
router.use("/news", newsRoutes);
router.use("/media-news", mediaNewsRoutes);
router.use("/site-data", siteDataRoutes);
router.use("/news-comment", newsCommentRoutes);
router.use("/media-news-comment", mediaNewsCommentRoutes);
router.use("/advertise",advertiseRoutes)
module.exports = router;
