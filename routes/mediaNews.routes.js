const express = require("express");
const { authenticate } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { mediaNewsValidation } = require("../validations/mediaNews.validation");
const mediaNewsController = require("../controllers/mediaNews.controller");

const router = express.Router();

router.post(
  "/add",
  authenticate(["admin"]),
  validate(mediaNewsValidation.add),
  mediaNewsController.createNews
);

router.get("/", authenticate(["admin"]), mediaNewsController.getAllMediaNews);

router.get(
  "/published",
  mediaNewsController.getAllPublishedMediaNews
);

router.get("/:id", mediaNewsController.getMediaNewsById);

router.put(
  "/update/:id",
  authenticate(["admin"]),
  validate(mediaNewsValidation.add),
  mediaNewsController.updateMediaNews
);

router.delete(
  "/delete/:id",
  authenticate(["admin"]),
  mediaNewsController.deleteMediaNews
);

module.exports = router;
