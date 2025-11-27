const Joi = require("joi");

exports.userValidation = {
  register: Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
      "string.base": "Name must be a text value",
      "string.empty": "Name cannot be empty",
      "string.min": "Name should have at least 2 characters",
      "any.required": "Name is required",
    }),

    email: Joi.string().email().required().messages({
      "string.email": "Please enter a valid email address",
      "any.required": "Email is required",
    }),

    mobileNumber: Joi.string()
      .pattern(/^[0-9]{10}$/)
      .optional()
      .allow(null, "")
      .messages({
        "string.pattern.base": "Mobile number must be a valid 10-digit number",
      }),

    password: Joi.string()
      .min(6)
      .max(30)
      .pattern(
        new RegExp("^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@#$%^&+=!]{6,30}$")
      )
      .required()
      .messages({
        "string.pattern.base":
          "Password must contain at least one letter and one number",
        "string.min": "Password should be at least 6 characters long",
        "any.required": "Password is required",
      }),
  }),

  changePassword: Joi.object({
    newPassword: Joi.string()
      .min(6)
      .max(30)
      .pattern(
        new RegExp("^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@#$%^&+=!]{6,30}$")
      )
      .required()
      .messages({
        "string.pattern.base":
          "Password must contain at least one letter and one number",
        "string.min": "Password should be at least 6 characters long",
        "any.required": "Password is required",
      }),
    oldPassword: Joi.string()
      .min(6)
      .max(30)
      .pattern(
        new RegExp("^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@#$%^&+=!]{6,30}$")
      )
      .required()
      .messages({
        "string.pattern.base":
          "Password must contain at least one letter and one number",
        "string.min": "Password should be at least 6 characters long",
        "any.required": "Password is required",
      }),
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Please enter a valid email address",
      "any.required": "Email is required",
    }),
  }),

  resetPassword: Joi.object({
    password: Joi.string()
      .min(6)
      .max(30)
      .pattern(
        new RegExp("^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@#$%^&+=!]{6,30}$")
      )
      .required()
      .messages({
        "string.pattern.base":
          "Password must contain at least one letter and one number",
        "string.min": "Password should be at least 6 characters long",
        "any.required": "Password is required",
      }),
  }),
  resetToken: Joi.string().required().messages({
    "string.base": "Reset token must be a text value",
    "any.required": "Reset token is required",
  }),
};
