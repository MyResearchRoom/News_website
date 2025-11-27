const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth.middleware");
const commentController = require("../controllers/newsComment.controller");
const { commentValidation } = require("../validations/newsComment.validation");
const { validate } = require("../middlewares/validate.middleware");

// Public (fetch approved comments)
router.get("/news/:newsId", commentController.getCommentsByNews);

// Protected (for logged-in users)
router.post(
  "/add",
  authenticate(["user"]),
  validate(commentValidation.add),
  commentController.addComment
);
router.put(
  "/:id",
  authenticate(["user"]),
  validate(commentValidation.update),
  commentController.updateComment
);

router.delete(
  "/:id",
  authenticate(["user", "admin"]),
  commentController.deleteComment
);

// Admin/moderator
router.patch(
  "/:id/status",
  authenticate(["admin"]),
  validate(commentValidation.status),
  commentController.changeCommentStatus
);
router.post(
  "/:id/reply",
  authenticate(["admin"]),
  validate(commentValidation.reply),
  commentController.replyToComment
);
router.get("/all", authenticate(["admin"]), commentController.getAllComments);

module.exports = router;
