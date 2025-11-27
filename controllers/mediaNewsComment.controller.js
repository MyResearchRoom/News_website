const { MediaNewsComment, MediaNews, User } = require("../models");
const { successResponse, errorResponse } = require("../utils/response");

exports.addComment = async (req, res) => {
  try {
    const { mediaNewsId, comment } = req.body;

    const news = await MediaNews.findByPk(mediaNewsId);
    if (!news) return errorResponse(res, "News not found", 404);

    const newComment = await MediaNewsComment.create({
      mediaNewsId,
      userId: req.user.id,
      comment,
    });

    successResponse(res, "Comment added successfully", newComment);
  } catch (err) {
    errorResponse(res, "Failed to add comment", 500);
  }
};

exports.updateComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await MediaNewsComment.findByPk(id);
    if (!comment) return errorResponse(res, "Comment not found", 404);

    if (req.user.id !== comment.userId)
      return errorResponse(res, "Unauthorized", 403);

    await comment.update({ comment: req.body.comment, status: "pending" });
    successResponse(res, "Comment updated successfully", comment);
  } catch (err) {
    errorResponse(res, "Failed to update comment", 500);
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await MediaNewsComment.findByPk(id);
    if (!comment) return errorResponse(res, "Comment not found", 404);

    await comment.destroy();
    successResponse(res, "Comment deleted successfully");
  } catch (err) {
    errorResponse(res, "Failed to delete comment", 500);
  }
};

exports.replyToComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await MediaNewsComment.findByPk(id);
    if (!comment) return errorResponse(res, "Comment not found", 404);

    await comment.update({ reply: req.body.reply });
    successResponse(res, "Reply added successfully", comment);
  } catch (err) {
    errorResponse(res, "Failed to reply to comment", 500);
  }
};

exports.changeCommentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await MediaNewsComment.findByPk(id);
    if (!comment) return errorResponse(res, "Comment not found", 404);

    await comment.update({ status: req.body.status });
    successResponse(res, `Comment ${req.body.status} successfully`, comment);
  } catch (err) {
    errorResponse(res, "Failed to update comment status", 500);
  }
};

exports.getCommentsByNews = async (req, res) => {
  try {
    const { page, limit, offset } = validateQueryParams({
      ...req.query,
    });
    const { mediaNewsId } = req.params;

    const { rows, count } = await MediaNewsComment.findAndCountAll({
      where: { mediaNewsId, status: "approved" },
      include: {
        model: User,
        as: "user",
        attributes: ["id", "name"],
      },
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    successResponse(res, "Fetched comments successfully", {
      comments: rows,
      pagination: {
        totalRecords: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        itemsPerPage: limit,
      },
    });
  } catch (err) {
    errorResponse(res, "Failed to fetch comments", 500);
  }
};

exports.getAllComments = async (req, res) => {
  try {
    const { page, limit, offset, searchTerm } = validateQueryParams({
      ...req.query,
    });
    const { status } = req.query;

    const whereClause = {};
    if (["pending", "approved", "rejected"].includes(status))
      whereClause.status = status;
    if (searchTerm) {
      whereClause[Op.or] = [
        { "$user.name$": { [Op.like]: `%${searchTerm}%` } },
        { "$mediaNews.title$": { [Op.like]: `%${searchTerm}%` } },
        { comment: { [Op.like]: `%${searchTerm}%` } },
      ];
    }

    const { rows, count } = await MediaNewsComment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name"],
        },
        {
          model: MediaNews,
          as: "mediaNews",
          attributes: ["id", "title"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    successResponse(res, "Fetched comments successfully", {
      comments: rows,
      pagination: {
        totalRecords: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        itemsPerPage: limit,
      },
    });
  } catch (err) {
    errorResponse(res, "Failed to fetch comments", 500);
  }
};
