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

router.post("/users/register", register);
router.post("/users/login", login);
router.get("/users/current",authenticate, getCurrent);
router.post("/users/logout", authenticate, logout);

module.exports = router;