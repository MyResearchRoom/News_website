const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");
const siteDataController = require("../controllers/siteData.controller");

router.post(
  "/save",
  authenticate(["admin"]),
  upload.fields([
    { name: "siteLogo", maxCount: 1 },
    { name: "favicon", maxCount: 1 },
  ]),
  siteDataController.addOrUpdateSiteData
);

router.get("/get", authenticate(["admin"]), siteDataController.getSiteData);

router.get("/public", siteDataController.getPublicSiteData);

module.exports = router;
