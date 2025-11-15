const { SiteData } = require("../models");
const { successResponse, errorResponse } = require("../utils/response");

exports.addOrUpdateSiteData = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      siteTitleMarathi,
      siteTitleEnglish,
      contactEmail,
      language,
      autoPublishApprovedArticle,
    } = req.body;

    let siteLogo = req.files?.siteLogo?.[0] || null;
    let favicon = req.files?.favicon?.[0] || null;

    if (siteLogo) {
      siteLogo = `data:${siteLogo.mimetype};base64,${siteLogo.buffer.toString(
        "base64"
      )}`;
    }
    if (favicon) {
      favicon = `data:${favicon.mimetype};base64,${favicon.buffer.toString(
        "base64"
      )}`;
    }

    const existingData = await SiteData.findOne({
      where: { userId },
    });

    let siteData;

    if (existingData) {
      await existingData.update({
        siteTitleMarathi,
        siteTitleEnglish,
        contactEmail,
        language,
        autoPublishApprovedArticle,
        ...(siteLogo && { siteLogo }),
        ...(favicon && { favicon }),
      });
      siteData = existingData;
    } else {
      siteData = await SiteData.create({
        userId,
        siteTitleMarathi,
        siteTitleEnglish,
        contactEmail,
        language,
        autoPublishApprovedArticle,
        siteLogo,
        favicon,
      });
    }

    const responseData = {
      ...siteData.get(),
      siteLogo: siteData.siteLogo ? siteData.siteLogo.toString("base64") : null,
      favicon: siteData.favicon ? siteData.favicon.toString("base64") : null,
    };

    successResponse(res, "Site data saved successfully", responseData);
  } catch (error) {
    errorResponse(res, "Failed to update site data", 500);
  }
};

exports.getSiteData = async (req, res) => {
  try {
    const userId = req.user.id;

    const siteData = await SiteData.findOne({
      where: { userId },
    });

    if (!siteData) {
      return errorResponse(res, "No site data found for this user", 404);
    }

    const responseData = {
      ...siteData.get(),
      siteLogo: siteData.siteLogo ? siteData.siteLogo.toString("utf-8") : null,
      favicon: siteData.favicon ? siteData.favicon.toString("utf-8") : null,
    };

    successResponse(res, "Site data fetched successfully", responseData);
  } catch (error) {
    errorResponse(res, "Failed to fetch site data", 500);
  }
};

exports.getPublicSiteData = async (req, res) => {
  try {
    const siteData = await SiteData.findOne({
      attributes: [
        "siteTitleMarathi",
        "siteTitleEnglish",
        "contactEmail",
        "siteLogo",
        "favicon",
        "language",
      ],
    });

    if (!siteData) {
      return errorResponse(res, "No site data found", 404);
    }

    const responseData = {
      ...siteData.get(),
      siteLogo: siteData.siteLogo ? siteData.siteLogo.toString("utf-8") : null,
      favicon: siteData.favicon ? siteData.favicon.toString("utf-8") : null,
    };

    successResponse(res, "Site data fetched successfully", responseData);
  } catch (error) {
    errorResponse(res, "Failed to fetch site data", 500);
  }
};
