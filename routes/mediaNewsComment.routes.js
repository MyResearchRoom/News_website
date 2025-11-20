const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth.middleware");
const mediaCommentController = require("../controllers/mediaNewsComment.controller");
const {
  commentValidation,
} = require("../validations/mediaNewsComment.validation");
const { validate } = require("../middlewares/validate.middleware");

// Public (fetch approved comments)
router.get("/news/:newsId", mediaCommentController.getCommentsByNews);

// Protected (for logged-in users)
router.post(
  "/add",
  authenticate(["user"]),
  validate(commentValidation.add),
  mediaCommentController.addComment
);
router.put(
  "/:id",
  authenticate(["user"]),
  validate(commentValidation.update),
  mediaCommentController.updateComment
);

router.delete(
  "/:id",
  authenticate(["user", "admin"]),
  mediaCommentController.deleteComment
);

// Admin/moderator
router.patch(
  "/:id/status",
  authenticate(["admin"]),
  validate(commentValidation.status),
  mediaCommentController.changeCommentStatus
);
router.post(
  "/:id/reply",
  authenticate(["admin"]),
  validate(commentValidation.reply),
  mediaCommentController.replyToComment
);
router.get(
  "/all",
  authenticate(["admin"]),
  mediaCommentController.getAllComments
);

module.exports = router;
