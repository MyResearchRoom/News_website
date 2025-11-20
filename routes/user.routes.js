const { Router } = require("express");
const { authenticate } = require("../middlewares/auth.middleware");
const userController = require("../controllers/user.controller");
const { userValidation } = require("../validations/user.validation");
const { validate } = require("../middlewares/validate.middleware");
const router = Router();

router.post(
  "/register/admin",
  validate(userValidation.register),
  userController.registerAdmin
);

router.post(
  "/register/user",
  validate(userValidation.register),
  userController.registerEndUser
);

router.post("/login", userController.login);

router.post("/me", authenticate([]), userController.getUserProfile);

router.post(
  "/change-password",
  authenticate([]),
  validate(userValidation.changePassword),
  userController.changePassword
);

router.post(
  "/forgot-password",
  authenticate([]),
  validate(userValidation.forgotPassword),
  userController.forgotPassword
);

router.post(
  "/reset-password",
  authenticate([]),
  validate(userValidation.resetPassword),
  userController.resetPassword
);

module.exports = router;
