const express = require("express");

const controllers = require("../../controllers/auth");

const authenticate = require("../../middlewares/authenticate.js");

const upload = require("../../middlewares/upload.js");

const router = express.Router();

const {
  register,
  login,
  getCurrent,
  logout,
  updateAvatar,
  verify,
  resendVerify,
} = controllers;

router.post("/register", register);
router.get("/verify/:verificationToken", verify);
router.post("/verify", resendVerify);
router.post("/login", login);
router.get("/current", authenticate, getCurrent);
router.post("/logout", authenticate, logout);
router.patch(
  "/avatars",
  authenticate,
  upload.single("avatar"),
  updateAvatar
);

module.exports = router;
