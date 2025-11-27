const { Op, fn, col } = require("sequelize");
const { News, NewsView, Category, sequelize } = require("../models");
const { successResponse, errorResponse } = require("../utils/response");
const { validateQueryParams } = require("../utils/validateQueryParams");
const moment = require("moment-timezone");

// const jobQueue = require("../queues/jobQueue");

exports.createNews = async (req, res) => {
  try {
    const { title, content, categoryId, status, publishedAt, tags } = req.body;

    if (status === "scheduled" && !publishedAt) {
      return errorResponse(
        res,
        "Published date/time required for scheduled news",
        400
      );
    }

    const existing = await News.findOne({ where: { title } });
    if (existing) {
      return errorResponse(res, "News with this title already exists", 400);
    }
    const thumbnailFile = req.files?.thumbnail?.[0];
    const documentFile = req.files?.pdf?.[0];

    if (!thumbnailFile) {
      return errorResponse(res, "Thumbnail image is required", 400);
    }

    if (thumbnailFile.size > 2 * 1024 * 1024) {
      return errorResponse(res, "Thumbnail must be less than 2MB", 400);
    }
    if (documentFile && documentFile.size > 5 * 1024 * 1024) {
      return errorResponse(res, "Pdf must be less than 5MB", 400);
    }

    const thumbnail = `data:${
      thumbnailFile.mimetype
    };base64,${thumbnailFile.buffer.toString("base64")}`;
    const pdf = documentFile
      ? `data:${documentFile.mimetype};base64,${documentFile.buffer.toString(
          "base64"
        )}`
      : null;
    const pdfName = documentFile ? documentFile.originalname : null;

    const news = await News.create({
      title,
      content,
      categoryId,
      status,
      tags,
      thumbnail,
      publishedAt:
        status === "scheduled"
          ? new Date(publishedAt)
          : status === "published"
          ? new Date()
          : null,
      pdf,
      pdfName,
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

    successResponse(res, "News created successfully", {
      ...news.dataValues,
      thumbnail: news.thumbnail.toString("utf-8"),
      pdf: news.pdf ? news.pdf.toString("utf-8") : null,
      content: news.content.toString("utf-8"),
    });
  } catch (error) {
    errorResponse(res, "Failed to create news", 500);
  }
};

exports.getAllNews = async (req, res) => {
  try {
    const { page, limit, offset, searchTerm } = validateQueryParams({
      ...req.query,
    });
    const { categoryId } = req.query;
    const whereClause = {};
    if (categoryId) whereClause.categoryId = categoryId;
    if (searchTerm) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${searchTerm}%` } },
        { tags: { [Op.like]: `%${searchTerm}%` } },
      ];
    }
    const { rows, count } = await News.findAndCountAll({
      attributes: {
        exclude: ["content", "thumbnail", "pdf", "pdfName"],
      },
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
    errorResponse(res, "Failed to fetch news", 500);
  }
};

exports.getAllPublishedNews = async (req, res) => {
  try {
    const { page, limit, offset, searchTerm } = validateQueryParams({
      ...req.query,
    });
    const { categoryId } = req.query;
    const visitorId = req.clientIp;
    const whereClause = { status: "published" };
    if (categoryId) whereClause.categoryId = categoryId;
    if (searchTerm) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${searchTerm}%` } },
        { tags: { [Op.like]: `%${searchTerm}%` } },
      ];
    }
    const { rows, count } = await News.findAndCountAll({
      attributes: {
        exclude: ["content", "pdf", "pdfName"],
      },
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

    let viewedNewsIds = [];
    if (visitorId) {
      const viewedRecords = await NewsView.findAll({
        where: { visitorId },
        attributes: ["newsId"],
      });
      viewedNewsIds = viewedRecords.map((r) => r.newsId);
    }

    const data = rows.map((item) => ({
      ...item.dataValues,
      category: item.dataValues.category,
      thumbnail: item.dataValues.thumbnail.toString("utf-8"),
      isViewed: visitorId ? viewedNewsIds.includes(item.id) : false,
    }));

    successResponse(res, "Fetched all news successfully", {
      news: data,
      pagination: {
        totalRecords: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    errorResponse(res, "Failed to fetch news", 500);
  }
};

exports.getNewsById = async (req, res) => {
  try {
    const { id } = req.params;
    const news = await News.findByPk(id, {
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "categoryNameEnglish", "categoryNameMarathi"],
        },
      ],
    });

    if (!news) return errorResponse(res, "News not found", 404);

    successResponse(res, "Fetched news successfully", {
      ...news.dataValues,
      thumbnail: news.thumbnail.toString("utf-8"),
      pdf: news.pdf ? news.pdf.toString("utf-8") : null,
      content: news.content.toString("utf-8"),
    });
  } catch (error) {
    errorResponse(res, "Failed to fetch news", 500);
  }
};

exports.updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const news = await News.findByPk(id);

    if (!news) return errorResponse(res, "News not found", 404);

    const { title, content, categoryId, status, publishedAt, tags } = req.body;

    const thumbnailFile = req.files?.thumbnail?.[0];
    const documentFile = req.files?.pdf?.[0];

    if (thumbnailFile && thumbnailFile.size > 2 * 1024 * 1024) {
      return errorResponse(res, "Thumbnail must be less than 2MB", 400);
    }
    if (documentFile && documentFile.size > 5 * 1024 * 1024) {
      return errorResponse(res, "Pdf must be less than 5MB", 400);
    }

    const thumbnail = thumbnailFile
      ? `data:${thumbnailFile.mimetype};base64,${thumbnailFile.buffer.toString(
          "base64"
        )}`
      : news.thumbnail;
    const pdf = documentFile
      ? `data:${documentFile.mimetype};base64,${documentFile.buffer.toString(
          "base64"
        )}`
      : news.pdf;
    const pdfName = documentFile ? documentFile.originalname : news.pdfName;

    await news.update({
      title,
      content,
      categoryId,
      status,
      tags,
      thumbnail,
      publishedAt:
        status === "scheduled"
          ? new Date(publishedAt)
          : status === "published"
          ? new Date()
          : news.publishedAt,
      pdf,
      pdfName,
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

    successResponse(res, "News updated successfully", {
      ...news.dataValues,
      thumbnail: news.thumbnail.toString("utf-8"),
      pdf: news.pdf ? news.pdf.toString("utf-8") : null,
      content: news.content.toString("utf-8"),
    });
  } catch (error) {
    errorResponse(res, "Failed to update news", 500);
  }
};

exports.deleteNews = async (req, res) => {
  try {
    const { id } = req.params;
    const news = await News.findByPk(id);

    if (!news) return errorResponse(res, "News not found", 404);

    await news.destroy();

    successResponse(res, "News deleted successfully");
  } catch (error) {
    errorResponse(res, "Failed to delete news", 500);
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalArticles,
      totalPublishedToday,
      totalPending,
      articleCountByCategory,
    ] = await Promise.all([
      News.count(),
      News.count({
        where: {
          publishedAt: {
            [Op.between]: [
              moment().tz("Asia/Kolkata").startOf("day").toDate(),
              moment().tz("Asia/Kolkata").endOf("day").toDate(),
            ],
          },
        },
      }),
      News.count({ where: { status: "draft" } }),
      News.findAll({
        where: {
          status: "published",
        },
        attributes: [
          "categoryId",
          [fn("COUNT", col("News.id")), "totalArticles"],
        ],
        include: [
          {
            model: Category,
            attributes: ["categoryNameEnglish", "categoryNameMarathi"],
            as: "category",
          },
        ],
        group: [
          "categoryId",
          "category.categoryNameEnglish",
          "category.categoryNameMarathi",
        ],
      }),
    ]);

    successResponse(res, "Stats retrieved successfully", {
      totalArticles,
      totalPending,
      totalPublishedToday,
      articleCountByCategory,
    });
  } catch (error) {
    errorResponse(res, "Failed to get stats", 500);
  }
};

// exports.incrementViewCount = async (req, res) => {
//   const { id } = req.params;
//   const visitorId = req.clientIp;

//   if (!visitorId) {
//     return errorResponse(res, "Visitor ID is required", 400);
//   }

//   const transaction = await sequelize.transaction();
//   try {
//     await NewsView.create({ newsId: id, visitorId }, { transaction });

//     await News.increment({ viewCount: 1 }, { where: { id }, transaction });

//     await transaction.commit();
//     return successResponse(res, "View counted successfully");
//   } catch (err) {
//     // ❗ DUPLICATE ENTRY ERROR
//     if (err.name === "SequelizeUniqueConstraintError") {
//       await transaction.rollback();
//       return successResponse(res, "View already counted");
//     }

//     await transaction.rollback();
//     return errorResponse(res, "Failed to count view", 500);
//   }
// };


exports.incrementViewCount = async (req, res) => {
  const { id } = req.params;
  const visitorId = req.clientIp;

  if (!visitorId) {
    return errorResponse(res, "Visitor ID is required", 400);
  }

  try {
    const [result] = await sequelize.query(
      `
      INSERT IGNORE INTO news_views (newsId, visitorId)
      VALUES (:newsId, :visitorId)
      `,
      {
        replacements: { newsId: id, visitorId },
      }
    );

    if (result.affectedRows === 1) {
      await sequelize.query(
        `
        UPDATE news
        SET viewCount = viewCount + 1
        WHERE id = :id
        `,
        {
          replacements: { id },
        }
      );
    }

    return successResponse(res, "View counted successfully");
  } catch (err) {
    errorResponse(res, "Failed to count view", 500);
  }
};

exports.shareNews = async (req, res) => {
  const { id } = req.params;

  const article = await News.findByPk(id);
  if (!article) {
    return res.send(`
      <html>
        <head>
          <meta property="og:title" content="Article Not Found" />
          <meta property="og:description" content="This article does not exist." />

        </head>
        <body></body>
      </html>
    `);
  }

  res.send(`
    <html>
      <head>
        <meta property="og:title" content="${article.title}" />
        <meta property="og:image" content="https://unsplash.com/photos/family-standing-in-a-lush-green-field-with-tractor-Ab7yCgRb7SM" />
        <meta property="og:image" content="${article.thumbnail.toString(
          "utf8"
        )}" />
        <meta property="og:url" content="https://news.wesolutize.com/article/${id}" />
        <meta name="robots" content="noindex" />
      </head>
      <body>
        <script>
          // Auto-redirect user to real article page
          window.location.href = "https://news.wesolutize.com/article/${id}";
        </script>
      </body>
    </html>
  `);
};

exports.getMostViewedNews = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const date = new Date();
    date.setDate(date.getDate() - 7); // Last 7 days
    const news = await News.findAll({
      where: { status: "published", publishedAt: { [Op.gte]: date } },
      order: [["viewCount", "DESC"]],
      limit,
      attributes: {
        exclude: ["content", "pdf", "pdfName"],
      },
    });
    successResponse(res, "Fetched most viewed news successfully", { news });
  } catch (error) {
    errorResponse(res, "Failed to fetch most viewed news", 500);
  }
};
