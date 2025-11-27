// Import dependencies
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const userController = require("../controllers/user.controller");
const { successResponse, errorResponse } = require("../utils/response");
const { transporter } = require("../services/emailService");
const { createUser } = require("../services/user.service");

// Mock all external modules
jest.mock("bcrypt");
jest.mock("jsonwebtoken");
jest.mock("../models", () => ({
  User: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
  },
}));
jest.mock("../utils/response", () => ({
  successResponse: jest.fn(),
  errorResponse: jest.fn(),
}));
jest.mock("../services/user.service", () => ({
  createUser: jest.fn(),
}));
jest.mock("../services/emailService", () => ({
  transporter: { sendMail: jest.fn() },
}));

// Helper to create mock req/res
const mockReq = (body = {}, user = {}) => ({ body, user });
const mockRes = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
});

describe("User Controller Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===================================================
  // 1️⃣ registerAdmin
  // ===================================================
  describe("registerAdmin", () => {
    it("should register new admin successfully", async () => {
      const req = mockReq({
        name: "John",
        email: "john@example.com",
        mobileNumber: "9999999999",
        password: "123456",
      });
      const res = mockRes();

      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hashed123");
      createUser.mockResolvedValue({
        id: 1,
        name: "John",
        email: "john@example.com",
        mobileNumber: "9999999999",
      });

      await userController.registerAdmin(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ where: { email: "john@example.com" } });
      expect(createUser).toHaveBeenCalledWith(
        expect.objectContaining({ role: "admin", password: "hashed123" })
      );
      expect(successResponse).toHaveBeenCalledWith(
        res,
        "User registered successfully",
        expect.any(Object)
      );
    });

    it("should fail when email already exists", async () => {
      const req = mockReq({ email: "exists@gmail.com" });
      const res = mockRes();

      User.findOne.mockResolvedValue({ id: 1 });

      await userController.registerAdmin(req, res);

      expect(errorResponse).toHaveBeenCalledWith(res, "Email already in use", 400);
    });
  });

  // ===================================================
  // 2️⃣ registerEndUser
  // ===================================================
  describe("registerEndUser", () => {
    it("should register end user successfully", async () => {
      const req = mockReq({
        name: "Jane",
        email: "jane@example.com",
        mobileNumber: "8888888888",
        password: "123456",
      });
      const res = mockRes();

      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hashed456");
      createUser.mockResolvedValue({
        id: 2,
        name: "Jane",
        email: "jane@example.com",
      });

      await userController.registerEndUser(req, res);

      expect(createUser).toHaveBeenCalledWith(expect.objectContaining({ role: "user" }));
      expect(successResponse).toHaveBeenCalled();
    });
  });

  // ===================================================
  // 3️⃣ login
  // ===================================================
  describe("login", () => {
    it("should login successfully with valid credentials", async () => {
      const req = mockReq({ email: "john@example.com", password: "123456" });
      const res = mockRes();

      const mockUser = {
        id: 1,
        role: "admin",
        email: "john@example.com",
        password: "hashed",
        name: "John",
        mobileNumber: "9999999999",
      };
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("jwt_token");

      await userController.login(req, res);

      expect(jwt.sign).toHaveBeenCalled();
      expect(successResponse).toHaveBeenCalledWith(
        res,
        "User logged in successfully",
        expect.objectContaining({
          user: expect.any(Object),
          token: "jwt_token",
        })
      );
    });

    it("should return error for invalid password", async () => {
      const req = mockReq({ email: "john@example.com", password: "wrong" });
      const res = mockRes();

      User.findOne.mockResolvedValue({ password: "hashed" });
      bcrypt.compare.mockResolvedValue(false);

      await userController.login(req, res);

      expect(errorResponse).toHaveBeenCalledWith(res, "Invalid email or password", 401);
    });

    it("should return error if user not found", async () => {
      const req = mockReq({ email: "missing@gmail.com" });
      const res = mockRes();

      User.findOne.mockResolvedValue(null);

      await userController.login(req, res);

      expect(errorResponse).toHaveBeenCalledWith(res, "Invalid email or password", 401);
    });
  });

  // ===================================================
  // 4️⃣ getUserProfile
  // ===================================================
  describe("getUserProfile", () => {
    it("should return user profile successfully", async () => {
      const req = mockReq({}, { id: 1 });
      const res = mockRes();

      User.findByPk.mockResolvedValue({
        id: 1,
        name: "John",
        email: "john@example.com",
      });

      await userController.getUserProfile(req, res);

      expect(successResponse).toHaveBeenCalledWith(
        res,
        "User profile fetched successfully",
        expect.any(Object)
      );
    });

    it("should return error if user not found", async () => {
      const req = mockReq({}, { id: 99 });
      const res = mockRes();

      User.findByPk.mockResolvedValue(null);

      await userController.getUserProfile(req, res);

      expect(errorResponse).toHaveBeenCalledWith(res, "User not found", 404);
    });
  });

  // ===================================================
  // 5️⃣ changePassword
  // ===================================================
  describe("changePassword", () => {
    it("should change password successfully", async () => {
      const req = mockReq(
        { oldPassword: "old123", newPassword: "new123" },
        { id: 1, password: "hashed" }
      );
      const res = mockRes();

      bcrypt.compare.mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue("hashed_new");
      User.update.mockResolvedValue([1]);

      await userController.changePassword(req, res);

      expect(bcrypt.compare).toHaveBeenCalled();
      expect(User.update).toHaveBeenCalledWith(
        { password: "hashed_new" },
        { where: { id: 1 } }
      );
      expect(successResponse).toHaveBeenCalledWith(res, "Password updated successfully");
    });

    it("should return error for invalid old password", async () => {
      const req = mockReq(
        { oldPassword: "wrong", newPassword: "new123" },
        { id: 1, password: "hashed" }
      );
      const res = mockRes();

      bcrypt.compare.mockResolvedValue(false);

      await userController.changePassword(req, res);

      expect(errorResponse).toHaveBeenCalledWith(res, "Please provide valid old password", 400);
    });
  });

  // ===================================================
  // 6️⃣ forgotPassword
  // ===================================================
  describe("forgotPassword", () => {
    it("should send reset link if user exists", async () => {
      const req = mockReq({ email: "john@example.com" });
      const res = mockRes();

      const mockUser = { id: 1, save: jest.fn() };
      User.findOne.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue("reset_token");

      await userController.forgotPassword(req, res);

      expect(mockUser.save).toHaveBeenCalled();
      expect(transporter.sendMail).toHaveBeenCalled();
      expect(successResponse).toHaveBeenCalled();
    });
  });

  // ===================================================
  // 7️⃣ resetPassword
  // ===================================================
  describe("resetPassword", () => {
    it("should reset password successfully", async () => {
      const req = mockReq({ password: "new123", resetToken: "valid_token" });
      const res = mockRes();

      const mockUser = { save: jest.fn() };
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.hash.mockResolvedValue("hashed_new");

      await userController.resetPassword(req, res);

      expect(mockUser.password).toBe("hashed_new");
      expect(mockUser.save).toHaveBeenCalled();
      expect(successResponse).toHaveBeenCalledWith(res, "Password has been reset successfully.");
    });

    it("should return error for invalid reset token", async () => {
      const req = mockReq({ password: "new123", resetToken: "invalid" });
      const res = mockRes();

      User.findOne.mockResolvedValue(null);

      await userController.resetPassword(req, res);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        "Please provide valid secret for resetting password",
        404
      );
    });
  });
});
