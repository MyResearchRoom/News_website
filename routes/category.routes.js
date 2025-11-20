const expres = require("express");
const { authenticate } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { categoryValidation } = require("../validations/category.validation");
const categoryController = require("../controllers/category.controller");
const router = expres.Router();

router.post(
  "/add",
  authenticate(["admin"]),
  validate(categoryValidation.add),
  categoryController.createCategory
);

router.get("/list", categoryController.getAllCategories);

router.get("/:id", categoryController.getCategoryById);

router.put(
  "/update/:id",
  authenticate(["admin"]),
  validate(categoryValidation.add),
  categoryController.updateCategory
);

router.delete(
  "/delete/:id",
  authenticate(["admin"]),
  categoryController.deleteCategory
);

router.post(
  "/reorder",
  authenticate(["admin"]),
  categoryController.reorderCategories
);

module.exports = router;
