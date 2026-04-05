const express = require("express");
const router = express.Router();
const { authorizeRoles } = require("../../middleware");
const personasService = require("../../modules/personas/personas.service");
const authService = require("../../modules/auth/auth.service");
const { flash, extractError } = require("./helpers");

// GET /personas
router.get("/", authorizeRoles("admin"), async (req, res) => {
    try {
        const result = await personasService.enlistar();
        res.render("personas/list", {
            title: "Usuarios",
            personas: (result?.ok && result?.data) ? result.data : [],
        });
    } catch (error) {
        req.log.error({ err: error }, "Error personas list");
        flash(req, "error", "Error al cargar usuarios.");
        res.redirect("/dashboard");
    }
});

// GET /personas/nueva
router.get("/nueva", authorizeRoles("admin"), async (req, res) => {
    res.render("personas/form", {
        title: "Nuevo Usuario",
        isEdit: false,
        persona: null,
    });
});

// POST /personas/nueva
router.post("/nueva", authorizeRoles("admin"), async (req, res) => {
    try {
        const result = await authService.signup(req.body);
        if (!result?.ok) {
            flash(req, "error", result?.message || "Error al crear usuario.");
            return res.redirect("/personas/nueva");
        }
        flash(req, "success", "Usuario creado exitosamente.");
        res.redirect("/personas");
    } catch (error) {
        flash(req, "error", extractError(error));
        res.redirect("/personas/nueva");
    }
});

// GET /personas/:id/editar
router.get("/:id/editar", authorizeRoles("admin"), async (req, res) => {
    try {
        const result = await personasService.obtenerPorId(req.params.id);
        if (!result?.ok) {
            flash(req, "error", "Usuario no encontrado.");
            return res.redirect("/personas");
        }
        res.render("personas/form", {
            title: "Editar Usuario",
            isEdit: true,
            persona: result.data,
        });
    } catch (error) {
        flash(req, "error", "Error al cargar usuario.");
        res.redirect("/personas");
    }
});

// POST /personas/:id/editar
router.post("/:id/editar", authorizeRoles("admin"), async (req, res) => {
    try {
        const result = await personasService.modificar(req.params.id, req.body);
        if (!result?.ok) {
            flash(req, "error", result?.message || "Error al actualizar usuario.");
            return res.redirect(`/personas/${req.params.id}/editar`);
        }
        flash(req, "success", "Usuario actualizado exitosamente.");
        res.redirect("/personas");
    } catch (error) {
        flash(req, "error", extractError(error));
        res.redirect(`/personas/${req.params.id}/editar`);
    }
});

// GET /personas/:id/eliminar
router.get("/:id/eliminar", authorizeRoles("admin"), async (req, res) => {
    try {
        await personasService.eliminar(req.params.id);
        flash(req, "success", "Usuario eliminado exitosamente.");
    } catch (error) {
        flash(req, "error", "Error al eliminar usuario.");
    }
    res.redirect("/personas");
});

module.exports = router;
