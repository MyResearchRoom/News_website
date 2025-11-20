const Joi = require("joi");

exports.categoryValidation = {
  add: Joi.object({
    categoryNameEnglish: Joi.string()
      .min(2)
      .max(100)
      .optional()
      .allow(null, "")
      .messages({
        "string.base": "Category name (English) must be a string",
        "string.empty": "Category name (English) cannot be empty",
        "any.required": "Category name (English) is required",
      }),

    categoryNameMarathi: Joi.string().min(2).max(100).required().messages({
      "string.base": "Category name (Marathi) must be a string",
      "string.empty": "Category name (Marathi) cannot be empty",
      "any.required": "Category name (Marathi) is required",
    }),
  }),
};
