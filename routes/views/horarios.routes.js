const express = require("express");
const router = express.Router();
const { authorizeRoles } = require("../../middleware");
const horariosService = require("../../modules/horarios/horarios.service");
const canchasService = require("../../modules/canchas/canchas.service");
const { flash, extractError } = require("./helpers");

// GET /horarios
router.get("/", authorizeRoles("admin"), async (req, res) => {
    try {
        const { cancha_id, fecha } = req.query;
        const filters = {};
        if (cancha_id) filters.cancha_id = cancha_id;
        if (fecha) filters.fecha = fecha;

        const [horariosResult, canchasResult] = await Promise.all([
            horariosService.enlistar(filters),
            canchasService.enlistar(),
        ]);

        res.render("horarios/list", {
            title: "Horarios",
            horarios: (horariosResult?.ok && horariosResult?.data) ? horariosResult.data : [],
            canchas: (canchasResult?.ok && canchasResult?.data) ? canchasResult.data : [],
            filters: { cancha_id, fecha },
        });
    } catch (error) {
        req.log.error({ err: error }, "Error horarios list");
        flash(req, "error", "Error al cargar horarios.");
        res.redirect("/dashboard");
    }
});

// GET /horarios/nuevo
router.get("/nuevo", authorizeRoles("admin"), async (req, res) => {
    try {
        const canchasResult = await canchasService.enlistar();
        res.render("horarios/form", {
            title: "Nuevo Horario",
            isEdit: false,
            horario: null,
            canchas: (canchasResult?.ok && canchasResult?.data) ? canchasResult.data : [],
        });
    } catch (error) {
        flash(req, "error", "Error al cargar formulario.");
        res.redirect("/horarios");
    }
});

// POST /horarios/nuevo
router.post("/nuevo", authorizeRoles("admin"), async (req, res) => {
    try {
        const payload = { ...req.body };
        if (payload.disponible === "true") payload.disponible = true;
        if (payload.disponible === "false") payload.disponible = false;

        const result = await horariosService.crear(payload);
        if (!result?.ok) {
            flash(req, "error", result?.message || "Error al crear horario.");
            return res.redirect("/horarios/nuevo");
        }
        flash(req, "success", "Horario creado exitosamente.");
        res.redirect("/horarios");
    } catch (error) {
        flash(req, "error", extractError(error));
        res.redirect("/horarios/nuevo");
    }
});

// GET /horarios/:id/editar
router.get("/:id/editar", authorizeRoles("admin"), async (req, res) => {
    try {
        const [horarioResult, canchasResult] = await Promise.all([
            horariosService.obtenerPorId(req.params.id),
            canchasService.enlistar(),
        ]);
        if (!horarioResult?.ok) {
            flash(req, "error", "Horario no encontrado.");
            return res.redirect("/horarios");
        }
        res.render("horarios/form", {
            title: "Editar Horario",
            isEdit: true,
            horario: horarioResult.data,
            canchas: (canchasResult?.ok && canchasResult?.data) ? canchasResult.data : [],
        });
    } catch (error) {
        flash(req, "error", "Error al cargar horario.");
        res.redirect("/horarios");
    }
});

// POST /horarios/:id/editar
router.post("/:id/editar", authorizeRoles("admin"), async (req, res) => {
    try {
        const payload = { ...req.body };
        if (payload.disponible === "true") payload.disponible = true;
        if (payload.disponible === "false") payload.disponible = false;

        const result = await horariosService.modificar(req.params.id, payload);
        if (!result?.ok) {
            flash(req, "error", result?.message || "Error al modificar horario.");
            return res.redirect(`/horarios/${req.params.id}/editar`);
        }
        flash(req, "success", "Horario actualizado exitosamente.");
        res.redirect("/horarios");
    } catch (error) {
        flash(req, "error", extractError(error));
        res.redirect(`/horarios/${req.params.id}/editar`);
    }
});

// GET /horarios/:id/eliminar
router.get("/:id/eliminar", authorizeRoles("admin"), async (req, res) => {
    try {
        await horariosService.eliminar(req.params.id);
        flash(req, "success", "Horario eliminado exitosamente.");
    } catch (error) {
        flash(req, "error", "Error al eliminar horario.");
    }
    res.redirect("/horarios");
});

module.exports = router;
