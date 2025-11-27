const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { jwt_secret } = require("../config/config");

exports.authenticate = (roles = []) => {
  return async (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ error: "Access denied. No token provided." });
    }

    try {
      const decoded = jwt.verify(token, jwt_secret);

      console.log(decoded);

      const user = await User.findByPk(decoded.id, {
        attributes: ["id", "name", "email", "mobileNumber", "role", "password"],
      });
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      if (roles.length > 0 && !roles.includes(user.role)) {
        return res
          .status(403)
          .json({ success: false, message: "Unauthrized request." });
      }

      req.user = user;

      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid Or expired token, please login again.",
      });
    }
  };
};
