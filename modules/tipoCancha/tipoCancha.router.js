const express = require("express");
const router = express.Router();

const controller = require("./tipoCancha.controller");
const { checkUser, authorizeRoles } = require("../../middleware");

router.post("/", authorizeRoles("admin"), controller.crear);
router.patch("/:id", authorizeRoles("admin"), controller.modificar);
router.delete("/:id", authorizeRoles("admin"), controller.eliminar);
router.get("/:id", checkUser, controller.obtenerPorId);
router.get("/", checkUser, controller.enlistar);

module.exports = router;
