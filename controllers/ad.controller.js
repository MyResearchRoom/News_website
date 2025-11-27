const { Ad, AdView, sequelize } = require("../models");
const { successResponse, errorResponse } = require("../utils/response");

exports.addAd = async (req, res) => {
  try {
    const { url, content } = req.body;

    const thumbnail = req.file
      ? `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`
      : null;

    if (!thumbnail && !content) {
      return errorResponse(
        res,
        "From 'thumbnail' and 'content', one is required.",
        400
      );
    }

    const ad = await Ad.create({
      url,
      thumbnail,
      content,
    });

    successResponse(res, "Ad created successfully", {
      ...ad.dataValues,
      thumbnail: ad.thumbnail ? ad.thumbnail.toString("utf-8") : null,
      content: ad.content ? ad.content.toString("utf-8") : null,
    });
  } catch (error) {
    console.log(error);

    errorResponse(res, "Failed to add ad", 500);
  }
};

exports.getAllAds = async (req, res) => {
  try {
    const ads = await Ad.findAll({
      order: [["createdAt", "DESC"]],
    });

    const formatted = ads.map((ad) => ({
      ...ad.dataValues,
      thumbnail: ad.thumbnail ? ad.thumbnail?.toString("utf-8") : null,
      content: ad.content ? ad.content?.toString("utf-8") : null,
    }));

    successResponse(res, "Fetched ads", formatted);
  } catch (error) {
    console.log(error);
    
    errorResponse(res, "Failed to fetch ads", 500);
  }
};

exports.updateAd = async (req, res) => {
  try {
    const { id } = req.params;
    const { url } = req.body;

    const ad = await Ad.findByPk(id);
    if (!ad) return errorResponse(res, "Ad not found", 404);

    if (req.file)
      ad.thumbnail = `data:${
        req.file.mimetype
      };base64,${req.file.buffer.toString("base64")}`;
    if (url) ad.url = url;

    await ad.save();

    successResponse(res, "Ad updated successfully", {
      ...ad.dataValues,
      thumbnail: ad.thumbnail.toString("utf-8"),
    });
  } catch (error) {
    errorResponse(res, "Failed to update ad", 500);
  }
};

exports.deleteAd = async (req, res) => {
  try {
    const { id } = req.params;

    const ad = await Ad.findByPk(id);
    if (!ad) return errorResponse(res, "Ad not found", 404);
    await ad.destroy();
    successResponse(res, "Ad deleted successfully");
  } catch (error) {
    errorResponse(res, "Failed to delete ad", 500);
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
//     await AdView.create({ adId: id, visitorId }, { transaction });

//     await Ad.increment({ viewCount: 1 }, { where: { id }, transaction });

//     await transaction.commit();
//     return successResponse(res, "View counted successfully");
//   } catch (err) {
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
      INSERT IGNORE INTO ads_views (adId, visitorId)
      VALUES (:adId, :visitorId)
      `,
      {
        replacements: { adId: id, visitorId },
      }
    );
    if (result.affectedRows === 1) {
      await sequelize.query(
        `
        UPDATE ads
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
    console.log(err);

    return errorResponse(res, "Failed to count view", 500);
  }
};


exports.getActiveAds = async (req, res) => {
  try {
    const visitorId = req.clientIp;
    const rows = await Ad.findAll({
      where: { status: "active" },
    });

    let viewedAdIds = [];
    if (visitorId) {
      const viewedRecords = await AdView.findAll({
        where: { visitorId },
        attributes: ["adId"],
      });
      viewedAdIds = viewedRecords.map((r) => r.adId);
    }

    const data = rows.map((item) => ({
      ...item.dataValues,
      thumbnail: item?.dataValues?.thumbnail?.toString("utf-8"),
      content: item?.dataValues?.content?.toString("utf-8"),
      isViewed: visitorId ? viewedAdIds.includes(item.id) : false,
    }));

    successResponse(res, "Fetched all ads successfully", data);
  } catch (error) {
    errorResponse(res, "Failed to fetch ads", 500);
  }
};
