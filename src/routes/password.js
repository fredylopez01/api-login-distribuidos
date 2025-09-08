const express = require("express");
const router = express.Router();
const passwordController = require("../controllers/passwordController");
const {
  validatePasswordResetRequest,
  validatePasswordReset,
  validatePasswordChange,
  validateTokenRequest,
} = require("../middleware/validation");
const { verifyToken } = require("../middleware/auth");

router.post(
  "/forgot-password",
  validatePasswordResetRequest,
  passwordController.requestPasswordReset
);

router.post(
  "/reset-password",
  validatePasswordReset,
  passwordController.resetPassword
);

router.post(
  "/change-password",
  verifyToken,
  validatePasswordChange,
  passwordController.changePassword
);

router.post(
  "/validate-token",
  validateTokenRequest,
  passwordController.validateResetToken
);

module.exports = router;
