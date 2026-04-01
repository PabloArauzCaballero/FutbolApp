const express = require("express");
const router = express.Router();
const controller = require("./personas.controller");

router.post("/", controller.crear);
router.patch("/:id", controller.modificar);
router.delete("/:id", controller.eliminar);
router.get("/:id", controller.obtenerPorId);
router.get("/", controller.listar);

module.exports = router;