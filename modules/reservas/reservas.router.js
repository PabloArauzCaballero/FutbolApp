const express = require("express");
const router = express.Router();

const controller = require("./reservas.controller");
const { checkUser } = require("../../middleware");

router.use(checkUser);

router.post("/", controller.crear);
router.patch("/:id", controller.modificar);
router.delete("/:id", controller.eliminar);
router.get("/:id", controller.obtenerPorId);
router.get("/", controller.enlistar);

module.exports = router;
