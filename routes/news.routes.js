const express = require("express");
const { authenticate } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { newsValidation } = require("../validations/news.validation");
const newsController = require("../controllers/news.controller");
const upload = require("../middlewares/upload.middleware");

const router = express.Router();

router.post(
  "/add",
  authenticate(["admin"]),
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "pdf", maxCount: 1 },
  ]),
  validate(newsValidation.add),
  newsController.createNews
);

router.get("/", authenticate(["admin"]), newsController.getAllNews);

router.get(
  "/published",
  authenticate([], false),
  newsController.getAllPublishedNews
);

router.get("/stats", authenticate(["admin"]), newsController.getDashboardStats);

router.get("/:id", newsController.getNewsById);

router.put(
  "/update/:id",
  authenticate(["admin"]),
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "pdf", maxCount: 1 },
  ]),
  validate(newsValidation.add),
  newsController.updateNews
);

router.delete(
  "/delete/:id",
  authenticate(["admin"]),
  newsController.deleteNews
);

router.post(
  "/:id/view",
  // authenticate(["user"]),
  newsController.incrementViewCount
);

router.get("/article/:id",newsController.shareNews);
router.get("/share/:id", (req, res) => {
  const shareUrl = `http://localhost:8000/api/news/article/${req.params.id}`;
  res.json({ shareUrl });
});

module.exports = router;
