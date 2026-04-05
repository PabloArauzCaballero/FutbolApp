const express = require("express");
const router = express.Router();

const controller = require("./auth.controller");
const { checkUser } = require("../../middleware");

router.post("/login", controller.login);
router.post("/signup", controller.signup);
router.get("/me", checkUser, controller.me);
router.post("/logout", checkUser, controller.logout);

module.exports = router;
