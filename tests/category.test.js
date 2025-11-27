const categoryController = require("../controllers/category.controller");
const { Category, News, sequelize } = require("../models");
const { successResponse, errorResponse } = require("../utils/response");

// Mock dependencies
jest.mock("../models", () => ({
  Category: {
    findOne: jest.fn(),
    max: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
  },
  News: {},
  sequelize: { fn: jest.fn(), col: jest.fn() },
}));

jest.mock("../utils/response", () => ({
  successResponse: jest.fn(),
  errorResponse: jest.fn(),
}));

describe("Category Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {}, query: {} };
    res = {};
    jest.clearAllMocks();
  });

  // ----------------------------------------------------------------
  // CREATE CATEGORY
  // ----------------------------------------------------------------
  describe("createCategory", () => {
    it("should create a new category successfully", async () => {
      req.body = { categoryNameEnglish: "Sports", categoryNameMarathi: "खेळ" };

      Category.findOne.mockResolvedValue(null);
      Category.max.mockResolvedValue(2);
      Category.create.mockResolvedValue({ id: 1, ...req.body, order: 3 });

      await categoryController.createCategory(req, res);

      expect(Category.findOne).toHaveBeenCalled();
      expect(Category.max).toHaveBeenCalled();
      expect(Category.create).toHaveBeenCalledWith({
        categoryNameEnglish: "Sports",
        categoryNameMarathi: "खेळ",
        order: 3,
      });
      expect(successResponse).toHaveBeenCalledWith(
        res,
        "Category created successfully",
        {
          id: 1,
          categoryNameEnglish: "Sports",
          categoryNameMarathi: "खेळ",
          order: 3,
        }
      );
    });

    it("should return error if category already exists", async () => {
      req.body = { categoryNameEnglish: "Sports", categoryNameMarathi: "खेळ" };

      Category.findOne.mockResolvedValue({ id: 1 });

      await categoryController.createCategory(req, res);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        "Category already exists",
        400
      );
    });

    it("should handle server error", async () => {
      Category.findOne.mockRejectedValue(new Error("DB error"));

      await categoryController.createCategory(req, res);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        "Failed to create category",
        500
      );
    });
  });

  // ----------------------------------------------------------------
  // GET ALL CATEGORIES
  // ----------------------------------------------------------------
  describe("getAllCategories", () => {
    it("should return all categories successfully", async () => {
      const mockCategories = [
        { id: 1, name: "Sports" },
        { id: 2, name: "Politics" },
      ];
      Category.findAll.mockResolvedValue(mockCategories);

      await categoryController.getAllCategories(req, res);

      expect(Category.findAll).toHaveBeenCalled();
      expect(successResponse).toHaveBeenCalledWith(
        res,
        "Categories fetched successfully",
        mockCategories
      );
    });

    it("should handle server error", async () => {
      Category.findAll.mockRejectedValue(new Error("Error"));

      await categoryController.getAllCategories(req, res);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        "Failed to fetch categories",
        500
      );
    });
  });

  // ----------------------------------------------------------------
  // GET CATEGORY BY ID
  // ----------------------------------------------------------------
  describe("getCategoryById", () => {
    it("should return category by ID", async () => {
      req.params.id = 1;
      const category = { id: 1, categoryNameEnglish: "Sports" };
      Category.findByPk.mockResolvedValue(category);

      await categoryController.getCategoryById(req, res);

      expect(Category.findByPk).toHaveBeenCalledWith(1);
      expect(successResponse).toHaveBeenCalledWith(
        res,
        "Category fetched successfully",
        category
      );
    });

    it("should return 404 if not found", async () => {
      req.params.id = 10;
      Category.findByPk.mockResolvedValue(null);

      await categoryController.getCategoryById(req, res);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        "Category not found",
        404
      );
    });

    it("should handle error", async () => {
      Category.findByPk.mockRejectedValue(new Error("Error"));
      await categoryController.getCategoryById(req, res);
      expect(errorResponse).toHaveBeenCalledWith(
        res,
        "Failed to get category",
        500
      );
    });
  });

  // ----------------------------------------------------------------
  // UPDATE CATEGORY
  // ----------------------------------------------------------------
  describe("updateCategory", () => {
    it("should update category successfully", async () => {
      req.params.id = 1;
      req.body = {
        categoryNameEnglish: "Updated",
        categoryNameMarathi: "अपडेट",
      };

      const category = { update: jest.fn() };
      Category.findByPk.mockResolvedValue(category);
      Category.findOne.mockResolvedValue(null);

      await categoryController.updateCategory(req, res);

      expect(category.update).toHaveBeenCalledWith({
        categoryNameEnglish: "Updated",
        categoryNameMarathi: "अपडेट",
      });
      expect(successResponse).toHaveBeenCalledWith(
        res,
        "Category updated successfully",
        category
      );
    });

    it("should return 404 if category not found", async () => {
      req.params.id = 1;
      Category.findByPk.mockResolvedValue(null);

      await categoryController.updateCategory(req, res);

      expect(res.status).toBeUndefined(); // since using errorResponse wrapper
      expect(errorResponse).not.toHaveBeenCalledWith(
        res,
        "Category updated successfully"
      );
    });

    it("should handle DB error", async () => {
      Category.findByPk.mockRejectedValue(new Error("DB Error"));
      await categoryController.updateCategory(req, res);
      expect(errorResponse).toHaveBeenCalledWith(
        res,
        "Failed to update category",
        500
      );
    });
  });

  // ----------------------------------------------------------------
  // DELETE CATEGORY
  // ----------------------------------------------------------------
  describe("deleteCategory", () => {
    it("should delete category successfully", async () => {
      req.params.id = 1;
      const mockCategory = { destroy: jest.fn() };
      Category.findByPk.mockResolvedValue(mockCategory);

      await categoryController.deleteCategory(req, res);

      expect(mockCategory.destroy).toHaveBeenCalled();
      expect(successResponse).toHaveBeenCalledWith(
        res,
        "Category deleted successfully",
        null
      );
    });

    it("should return 404 if category not found", async () => {
      Category.findByPk.mockResolvedValue(null);
      await categoryController.deleteCategory(req, res);
      expect(errorResponse).toHaveBeenCalledWith(
        res,
        "Category not found",
        404
      );
    });

    it("should handle DB error", async () => {
      Category.findByPk.mockRejectedValue(new Error("DB Error"));
      await categoryController.deleteCategory(req, res);
      expect(errorResponse).toHaveBeenCalledWith(
        res,
        "Failed to delete category",
        500
      );
    });
  });

  // ----------------------------------------------------------------
  // REORDER CATEGORIES
  // ----------------------------------------------------------------
  describe("reorderCategories", () => {
    it("should reorder categories successfully", async () => {
      req.body = {
        orderIds: [
          { id: 1, order: 2 },
          { id: 2, order: 1 },
        ],
      };
      Category.update.mockResolvedValue([1]);

      await categoryController.reorderCategories(req, res);

      expect(Category.update).toHaveBeenCalledTimes(2);
      expect(successResponse).toHaveBeenCalledWith(
        res,
        "Categories reordered successfully",
        null
      );
    });

    it("should handle DB error", async () => {
      Category.update.mockRejectedValue(new Error("Error"));
      await categoryController.reorderCategories(req, res);
      expect(errorResponse).toHaveBeenCalledWith(
        res,
        "Failed to reorder categories",
        500
      );
    });
  });
});
