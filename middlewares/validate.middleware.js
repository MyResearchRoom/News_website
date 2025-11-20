exports.validate = (schema) => {
  return (req, res, next) => {
    const options = {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true,
    };

    const { error, value } = schema.validate(req.body, options);

    if (error) {
      const details = error.details.map((d) => d.message.replace(/"/g, ""));
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: details,
      });
    }

    req.body = value;
    next();
  };
};
