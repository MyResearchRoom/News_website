const { User } = require("../models");
const { errorResponse, successResponse } = require("../utils/response");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { jwt_secret, forgot_password_jwt_secret } = require("../config/config");
const { createUser } = require("../services/user.service");
const { transporter } = require("../services/emailService");

exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, mobileNumber, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return errorResponse(res, "Email already in use", 400);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await createUser({
      name,
      email,
      mobileNumber,
      password: hashedPassword,
      role: "admin",
    });
    successResponse(res, "User registered successfully", {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      mobileNumber: newUser.mobileNumber,
    });
  } catch (error) {
    errorResponse(res, "Failed to register user", 500);
  }
};

exports.registerEndUser = async (req, res) => {
  try {
    const { name, email, mobileNumber, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return errorResponse(res, "Email already in use", 400);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await createUser({
      name,
      email,
      mobileNumber,
      password: hashedPassword,
      role: "user",
    });
    successResponse(res, "User registered successfully", {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      mobileNumber: newUser.mobileNumber,
    });
  } catch (error) {
    errorResponse(res, "Failed to register user", 500);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return errorResponse(res, "Invalid email or password", 401);
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return errorResponse(res, "Invalid email or password", 401);
    }

    const token = jwt.sign({ id: user.id, role: user.role }, jwt_secret, {
      expiresIn: "1d",
    });

    successResponse(res, "User logged in successfully", {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    errorResponse(res, "Failed to login user", 500);
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }
    successResponse(res, "User profile fetched successfully", user);
  } catch (error) {
    errorResponse(res, "Failed to fetch user profile", 500);
  }
};

exports.changePassword = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }
    const { oldPassword, newPassword } = req.body;

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return errorResponse(res, "Please provide valid old password", 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.update(
      { password: hashedPassword },
      { where: { id: req.user.id } }
    );

    successResponse(res, "Password updated successfully");
  } catch (error) {
    errorResponse(res, "Failed to change password", 500);
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({
      where: {
        email,
      },
      attributes: ["id", "resetToken"],
    });

    if (!user) {
      return successResponse(
        res,
        "If you have provided valid email, then you will going to receive email for resetting password"
      );
    }

    const resetToken = jwt.sign(
      { id: user.id, email },
      forgot_password_jwt_secret,
      {
        expiresIn: "1d",
      }
    );

    user.resetToken = resetToken;

    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `<p>You requested for a password reset. Click <a href="${process.env.CLIENT_URL}/reset-password/${resetToken}">here</a> to reset your password. The link will expire in 24 hours.</p>`,
    };

    await transporter.sendMail(mailOptions);

    successResponse(
      res,
      "If you have provided valid email, then you will going to receive email for resetting password"
    );
  } catch (error) {
    errorResponse(res, "Failed to forgot password", 500);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { password, resetToken } = req.body;

    if (!password || !resetToken) {
      return errorResponse(res, "Password and reset token are required.", 400);
    }

    const user = await User.findOne({
      where: {
        resetToken,
      },
    });

    if (!user) {
      return errorResponse(
        res,
        "Please provide valid secret for resetting password",
        404
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetToken = null;
    await user.save();

    successResponse(res, "Password has been reset successfully.");
  } catch (error) {
    errorResponse(res, "Failed to reset password.", 500);
  }
};
