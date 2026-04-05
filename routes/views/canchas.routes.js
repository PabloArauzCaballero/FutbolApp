const express = require("express");
const router = express.Router();
const { authorizeRoles } = require("../../middleware");
const canchasService = require("../../modules/canchas/canchas.service");
const tipoCanchaService = require("../../modules/tipoCancha/tipoCancha.service");
const { flash, extractError } = require("./helpers");

// GET /canchas
router.get("/", async (req, res) => {
    try {
        const result = await canchasService.enlistar();
        res.render("canchas/list", {
            title: "Canchas",
            canchas: (result?.ok && result?.data) ? result.data : [],
        });
    } catch (error) {
        req.log.error({ err: error }, "Error canchas list");
        flash(req, "error", "Error al cargar canchas.");
        res.redirect("/dashboard");
    }
});

// GET /canchas/:id
router.get("/:id", async (req, res) => {
    try {
        const result = await canchasService.obtenerPorId(req.params.id);
        if (!result?.ok) {
            flash(req, "error", "Cancha no encontrada.");
            return res.redirect("/canchas");
        }
        res.render("canchas/show", {
            title: result.data.nombre,
            cancha: result.data,
        });
    } catch (error) {
        flash(req, "error", "Error al buscar cancha.");
        res.redirect("/canchas");
    }
});

// GET /canchas/nueva (admin)
router.get("/nueva", authorizeRoles("admin"), async (req, res) => {
    try {
        const tiposResult = await tipoCanchaService.enlistar();
        res.render("canchas/form", {
            title: "Nueva Cancha",
            isEdit: false,
            cancha: null,
            tipos: (tiposResult?.ok && tiposResult?.data) ? tiposResult.data : [],
        });
    } catch (error) {
        flash(req, "error", "Error al cargar formulario.");
        res.redirect("/canchas");
    }
});

// POST /canchas/nueva (admin)
router.post("/nueva", authorizeRoles("admin"), async (req, res) => {
    try {
        const result = await canchasService.crear(req.body);
        if (!result?.ok) {
            flash(req, "error", result?.message || "Error al crear cancha.");
            return res.redirect("/canchas/nueva");
        }
        flash(req, "success", "Cancha creada exitosamente.");
        res.redirect("/canchas");
    } catch (error) {
        flash(req, "error", extractError(error));
        res.redirect("/canchas/nueva");
    }
});

// GET /canchas/:id/editar (admin)
router.get("/:id/editar", authorizeRoles("admin"), async (req, res) => {
    try {
        const [canchaResult, tiposResult] = await Promise.all([
            canchasService.obtenerPorId(req.params.id),
            tipoCanchaService.enlistar(),
        ]);
        if (!canchaResult?.ok) {
            flash(req, "error", "Cancha no encontrada.");
            return res.redirect("/canchas");
        }
        res.render("canchas/form", {
            title: "Editar Cancha",
            isEdit: true,
            cancha: canchaResult.data,
            tipos: (tiposResult?.ok && tiposResult?.data) ? tiposResult.data : [],
        });
    } catch (error) {
        flash(req, "error", "Error al cargar cancha.");
        res.redirect("/canchas");
    }
});

// POST /canchas/:id/editar (admin)
router.post("/:id/editar", authorizeRoles("admin"), async (req, res) => {
    try {
        const result = await canchasService.modificar(req.params.id, req.body);
        if (!result?.ok) {
            flash(req, "error", result?.message || "Error al modificar cancha.");
            return res.redirect(`/canchas/${req.params.id}/editar`);
        }
        flash(req, "success", "Cancha actualizada exitosamente.");
        res.redirect("/canchas");
    } catch (error) {
        flash(req, "error", extractError(error));
        res.redirect(`/canchas/${req.params.id}/editar`);
    }
});

// GET /canchas/:id/eliminar (admin)
router.get("/:id/eliminar", authorizeRoles("admin"), async (req, res) => {
    try {
        await canchasService.eliminar(req.params.id);
        flash(req, "success", "Cancha eliminada exitosamente.");
    } catch (error) {
        flash(req, "error", "Error al eliminar cancha.");
    }
    res.redirect("/canchas");
});

module.exports = router;
