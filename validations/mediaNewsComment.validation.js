const Joi = require("joi");

exports.commentValidation = {
  add: Joi.object({
    newsId: Joi.number().required().messages({
      "any.required": "News ID is required",
    }),
    comment: Joi.string().min(1).required().messages({
      "string.empty": "Comment cannot be empty",
      "any.required": "Comment is required",
    }),
  }),

  update: Joi.object({
    comment: Joi.string().min(1).required().messages({
      "string.empty": "Comment cannot be empty",
      "any.required": "Comment is required",
    }),
  }),

  reply: Joi.object({
    reply: Joi.string().min(1).required().messages({
      "string.empty": "Reply cannot be empty",
      "any.required": "Reply is required",
    }),
  }),

  status: Joi.object({
    status: Joi.string().valid("approved", "rejected").required().messages({
      "any.only": "Status must be either 'approved' or 'rejected'",
      "any.required": "Status is required",
    }),
  }),
};
