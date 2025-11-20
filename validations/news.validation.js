const Joi = require("joi");

exports.newsValidation = {
  add: Joi.object({
    title: Joi.string().min(3).max(200).required().messages({
      "string.base": "Title must be a string",
      "string.empty": "Title cannot be empty",
      "any.required": "Title is required",
    }),
    content: Joi.string().required().messages({
      "string.empty": "Content cannot be empty",
      "any.required": "Content is required",
    }),
    categoryId: Joi.number().integer().messages({
      "number.base": "Category ID must be a number",
    }),
    status: Joi.string()
      .valid("draft", "published", "archived", "scheduled", "approved")
      .default("draft")
      .messages({
        "any.only":
          "Status must be one of 'draft', 'published', or 'scheduled'",
      }),
    tags: Joi.string().optional().allow(null, "").messages({
      "string.base": "Tags must be a string saperated by commas",
    }),
    publishedAt: Joi.date().optional().allow(null).messages({
      "date.base": "Published date must be a valid date",
    }),
  }),

  update: Joi.object({
    title: Joi.string().min(3).max(200).optional(),
    content: Joi.string().optional(),
    categoryId: Joi.number().integer().optional().allow(null),
    status: Joi.string()
      .valid("draft", "published", "archived", "scheduled", "approved")
      .optional(),
    tags: Joi.string().optional().allow(null, ""),
  }),
};
