const express = require("express");

const controllers = require("../../controllers/auth");

const authenticate = require ("../../middlewares/authenticate.js")

const router = express.Router();

const {
  register,
  login,
  getCurrent,
  logout,
} = controllers;

router.post("/register", register);
router.post("/login", login);
router.get("/current",authenticate, getCurrent);
router.post("/logout", authenticate, logout);

module.exports = router;