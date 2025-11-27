const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload.middleware");
const {authenticate} = require("../middlewares/auth.middleware");

const controller = require("../controllers/ad.controller");

router.post(
  "/add",
  authenticate(["admin"]),
  upload.single("thumbnail"),
  controller.addAd
);

router.get("/", controller.getAllAds);
router.get("/active", controller.getActiveAds);

router.put(
  "/update/:id",
  authenticate(["admin"]),
  upload.single("thumbnail"),
  controller.updateAd
);

router.delete(
  "/delete/:id",
  authenticate(["admin"]),
  controller.deleteAd
);

router.post("/:id/view", controller.incrementViewCount);

module.exports = router;

