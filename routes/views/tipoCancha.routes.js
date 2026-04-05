const express = require("express");
const router = express.Router();
const { authorizeRoles } = require("../../middleware");
const tipoCanchaService = require("../../modules/tipoCancha/tipoCancha.service");
const { flash, extractError } = require("./helpers");

// GET /tipoCancha
router.get("/", authorizeRoles("admin"), async (req, res) => {
    try {
        const result = await tipoCanchaService.enlistar();
        res.render("tipoCancha/list", {
            title: "Tipos de Cancha",
            tipos: (result?.ok && result?.data) ? result.data : [],
        });
    } catch (error) {
        req.log.error({ err: error }, "Error tipoCancha list");
        flash(req, "error", "Error al cargar tipos de cancha.");
        res.redirect("/dashboard");
    }
});

// GET /tipoCancha/nueva
router.get("/nueva", authorizeRoles("admin"), async (req, res) => {
    res.render("tipoCancha/form", {
        title: "Nuevo Tipo de Cancha",
        isEdit: false,
        tipo: null,
    });
});

// POST /tipoCancha/nueva
router.post("/nueva", authorizeRoles("admin"), async (req, res) => {
    try {
        const result = await tipoCanchaService.crear(req.body);
        if (!result?.ok) {
            flash(req, "error", result?.message || "Error al crear tipo.");
            return res.redirect("/tipoCancha/nueva");
        }
        flash(req, "success", "Tipo de cancha creado exitosamente.");
        res.redirect("/tipoCancha");
    } catch (error) {
        flash(req, "error", extractError(error));
        res.redirect("/tipoCancha/nueva");
    }
});

// GET /tipoCancha/:id/editar
router.get("/:id/editar", authorizeRoles("admin"), async (req, res) => {
    try {
        const result = await tipoCanchaService.obtenerPorId(req.params.id);
        if (!result?.ok) {
            flash(req, "error", "Tipo no encontrado.");
            return res.redirect("/tipoCancha");
        }
        res.render("tipoCancha/form", {
            title: "Editar Tipo de Cancha",
            isEdit: true,
            tipo: result.data,
        });
    } catch (error) {
        flash(req, "error", "Error al cargar tipo.");
        res.redirect("/tipoCancha");
    }
});

// POST /tipoCancha/:id/editar
router.post("/:id/editar", authorizeRoles("admin"), async (req, res) => {
    try {
        const result = await tipoCanchaService.modificar(req.params.id, req.body);
        if (!result?.ok) {
            flash(req, "error", result?.message || "Error al modificar tipo.");
            return res.redirect(`/tipoCancha/${req.params.id}/editar`);
        }
        flash(req, "success", "Tipo actualizado exitosamente.");
        res.redirect("/tipoCancha");
    } catch (error) {
        flash(req, "error", extractError(error));
        res.redirect(`/tipoCancha/${req.params.id}/editar`);
    }
});

// GET /tipoCancha/:id/eliminar
router.get("/:id/eliminar", authorizeRoles("admin"), async (req, res) => {
    try {
        await tipoCanchaService.eliminar(req.params.id);
        flash(req, "success", "Tipo eliminado exitosamente.");
    } catch (error) {
        flash(req, "error", "Error al eliminar tipo.");
    }
    res.redirect("/tipoCancha");
});

module.exports = router;
