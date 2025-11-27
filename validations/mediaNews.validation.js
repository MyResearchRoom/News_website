const Joi = require("joi");

exports.mediaNewsValidation = {
  add: Joi.object({
    title: Joi.string().trim().required().messages({
      "string.empty": "Title is required",
    }),
    url: Joi.string().uri().required().messages({
      "string.empty": "URL is required",
      "string.uri": "Please provide a valid URL",
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
};
