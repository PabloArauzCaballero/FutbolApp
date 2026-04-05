const express = require("express");
const router = express.Router();

const controller = require("./personas.controller");
const { authorizeRoles } = require("../../middleware");

router.post("/", authorizeRoles("admin"), controller.crear);
router.patch("/:id", authorizeRoles("admin"), controller.modificar);
router.delete("/:id", authorizeRoles("admin"), controller.eliminar);
router.get("/:id", authorizeRoles("admin"), controller.obtenerPorId);
router.get("/", authorizeRoles("admin"), controller.enlistar);

module.exports = router;
