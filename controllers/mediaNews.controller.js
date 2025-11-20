const { Op } = require("sequelize");
const { MediaNews, Category } = require("../models");
const { errorResponse, successResponse } = require("../utils/response");
const { validateQueryParams } = require("../utils/validateQueryParams");

// const jobQueue = require("../queues/jobQueue");

exports.createNews = async (req, res) => {
  try {
    const { title, status, publishedAt, ...rest } = req.body;

    if (status === "scheduled" && !publishedAt) {
      return errorResponse(
        res,
        "Published date/time required for scheduled news",
        400
      );
    }

    const isExist = await MediaNews.findOne({
      where: {
        title,
      },
    });
    if (isExist) {
      return errorResponse(
        res,
        "Media news with this title already exists",
        400
      );
    }

    const mediaNews = await MediaNews.create({
      ...rest,
      title,
      status,
      publishedAt:
        status === "scheduled"
          ? new Date(publishedAt)
          : status === "published"
          ? new Date()
          : null,
    });

    // if (status === "scheduled") {
    //   const job = await jobQueue.add(
    //     "jobQueue",
    //     { id: news.id, type: "media_news" },
    //     {
    //       attempts: 3,
    //       backoff: {
    //         type: "exponential",
    //         delay: moment().tz("Asia/Kolkata").diff(new Date(publishedAt)),
    //       },
    //     }
    //   );
    // }

    successResponse(res, "Media news added successfully", mediaNews);
  } catch (error) {
    errorResponse(res, "Failed to add media news", 500);
  }
};

exports.getAllMediaNews = async (req, res) => {
  try {
    const { page, limit, offset, searchTerm } = validateQueryParams({
      ...req.query,
    });
    const { categoryId } = req.query;
    const whereClause = {};
    if (categoryId) whereClause.categoryId = categoryId;
    if (searchTerm)
      whereClause.title = {
        [Op.like]: `%${searchTerm}%`,
      };
    const { rows, count } = await MediaNews.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "categoryNameEnglish", "categoryNameMarathi"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    successResponse(res, "Fetched all news successfully", {
      news: rows,
      pagination: {
        totalRecords: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    errorResponse(res, "Failed to fetch media news", 500);
  }
};

exports.getAllPublishedMediaNews = async (req, res) => {
  try {
    const { page, limit, offset, searchTerm } = validateQueryParams({
      ...req.query,
    });
    const { categoryId } = req.query;

    const whereClause = { status: "published" };
    if (categoryId) whereClause.categoryId = categoryId;
    if (searchTerm)
      whereClause.title = {
        [Op.like]: `%${searchTerm}%`,
      };
    const { rows, count } = await MediaNews.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "categoryNameEnglish", "categoryNameMarathi"],
        },
      ],
      order: [["publishedAt", "DESC"]],
      limit,
      offset,
    });

    successResponse(res, "Fetched all news successfully", {
      news: rows,
      pagination: {
        totalRecords: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    errorResponse(res, "Failed to fetch media news", 500);
  }
};

exports.getMediaNewsById = async (req, res) => {
  try {
    const news = await MediaNews.findByPk(req.params.id, {
      include: [
        {
          model: Category,
          attributes: ["id", "categoryNameEnglish", "categoryNameMarathi"],
          as: "category",
        },
      ],
    });

    if (!news) {
      return errorResponse(res, "Media news not found", 400);
    }

    successResponse(res, "Media news fetched successfully", news);
  } catch (error) {
    errorResponse(res, "Failed to get media news", 500);
  }
};

exports.updateMediaNews = async (req, res) => {
  try {
    const { title, status, ...rest } = req.body;
    const mediaNews = await MediaNews.findByPk(req.params.id);

    if (title && mediaNews.title !== title) {
      const isExist = await MediaNews.findOne({
        where: {
          title,
        },
      });
      if (isExist) {
        return errorResponse(
          res,
          "Media news with this title already exists",
          400
        );
      }
    }

    await mediaNews.update({
      ...rest,
      title,
      status,
      publishedAt:
        status === "scheduled"
          ? new Date(publishedAt)
          : status === "published"
          ? new Date()
          : mediaNews.publishedAt,
    });

    // if (status === "scheduled") {
    //   const job = await jobQueue.add(
    //     "jobQueue",
    //     { id: news.id, type: "news" },
    //     {
    //       attempts: 3,
    //       backoff: {
    //         type: "exponential",
    //         delay: moment().tz("Asia/Kolkata").diff(new Date(publishedAt)),
    //       },
    //     }
    //   );
    // }

    successResponse(res, "Media news updated successfully", mediaNews);
  } catch (error) {
    errorResponse(res, "Failed to update media news", 500);
  }
};

exports.deleteMediaNews = async (req, res) => {
  try {
    const mediaNews = await MediaNews.findByPk(req.params.id);
    if (!mediaNews) {
      return errorResponse(res, "Media news not found", 404);
    }
    await mediaNews.destroy();
    successResponse(res, "Media news deleted successfully");
  } catch (error) {
    errorResponse(res, "Failed to delete media news", 500);
  }
};
