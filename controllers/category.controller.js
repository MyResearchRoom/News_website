const { Op } = require("sequelize");
const { Category, News, sequelize } = require("../models");
const { errorResponse, successResponse } = require("../utils/response");

exports.createCategory = async (req, res) => {
  try {
    const { categoryNameEnglish, categoryNameMarathi } = req.body;

    const existing = await Category.findOne({
      where: {
        [Op.or]: [{ categoryNameEnglish }, { categoryNameMarathi }],
      },
    });
    if (existing) {
      return errorResponse(res, "Category already exists", 400);
    }

    const order = await Category.max("order");

    const category = await Category.create({
      categoryNameEnglish,
      categoryNameMarathi,
      order: order ? order + 1 : 1,
    });

    successResponse(res, "Category created successfully", category);
  } catch (error) {
    errorResponse(res, "Failed to create category", 500);
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      attributes: {
        include: [[sequelize.fn("COUNT", sequelize.col("news.id")), "count"]],
      },
      include: [
        {
          model: News,
          attributes: [],
          as: "news",
        },
      ],
      group: ["Category.id"],
      order: [["order", "ASC"]],
    });

    successResponse(res, "Categories fetched successfully", categories);
  } catch (error) {
    errorResponse(res, "Failed to fetch categories", 500);
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return errorResponse(res, "Category not found", 404);
    }

    successResponse(res, "Category fetched successfully", category);
  } catch (error) {
    errorResponse(res, "Failed to get category", 500);
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryNameEnglish, categoryNameMarathi } = req.body;

    const category = await Category.findByPk(id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    const existing = await Category.findOne({
      where: {
        [Op.or]: [{ categoryNameEnglish }, { categoryNameMarathi }],
        id: { [Op.ne]: id },
      },
    });
    if (existing) {
      return errorResponse(res, "Category already exists", 400);
    }

    await category.update({ categoryNameEnglish, categoryNameMarathi });

    successResponse(res, "Category updated successfully", category);
  } catch (error) {
    errorResponse(res, "Failed to update category", 500);
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);
    if (!category) {
      return errorResponse(res, "Category not found", 404);
    }

    await category.destroy();

    successResponse(res, "Category deleted successfully", null);
  } catch (error) {
    errorResponse(res, "Failed to delete category", 500);
  }
};

exports.reorderCategories = async (req, res) => {
  try {
    const { orderIds } = req.body;

    const updatePromises = orderIds.map(({ id, order }) =>
      Category.update({ order }, { where: { id } })
    );
    await Promise.all(updatePromises);
    successResponse(res, "Categories reordered successfully", null);
  } catch (error) {
    errorResponse(res, "Failed to reorder categories", 500);
  }
};
