const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const {
  validateUserRegistration,
  validateRequiredFields,
} = require("../middleware/validation");
const { verifyToken, checkRole } = require("../middleware/auth");
const { userRoles } = require("../models/User");

router.post("/register", validateUserRegistration, userController.register);

router.get("/profile", verifyToken, userController.getUserProfile);

router.put(
  "/profile",
  verifyToken,
  validateRequiredFields(["email"]),
  userController.updateUserProfile
);

router.delete("/profile", verifyToken, userController.deleteUser);

router.delete(
  "/:id",
  verifyToken,
  checkRole([userRoles.ADMIN]),
  userController.deleteUser
);

router.get(
  "/",
  verifyToken,
  checkRole([userRoles.ADMIN]),
  userController.getAllUsers
);

router.get(
  "/role/:role",
  verifyToken,
  checkRole([userRoles.ADMIN]),
  userController.getUsersByRole
);

module.exports = router;
