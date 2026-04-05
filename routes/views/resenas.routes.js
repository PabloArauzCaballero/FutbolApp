const express = require("express");
const router = express.Router();
const { checkUser, authorizeRoles } = require("../../middleware");
const resenasService = require("../../modules/resenas/resenas.service");
const canchasService = require("../../modules/canchas/canchas.service");
const personasService = require("../../modules/personas/personas.service");
const { flash, extractError } = require("./helpers");

// GET /resenas
router.get("/", checkUser, async (req, res) => {
    try {
        const result = await resenasService.enlistar();
        
        // Si es cliente, filtrar solo las suyas para mostrar
        const todasResenas = (result?.ok && result?.data) ? result.data : [];
        const misResenas = req.user.rol === 'cliente' 
            ? todasResenas.filter(r => r.usuario_id === req.user.id)
            : todasResenas;
            
        res.render("resenas/list", {
            title: "Reseñas",
            resenas: misResenas,
            todasResenas: todasResenas,
        });
    } catch (error) {
        req.log.error({ err: error }, "Error resenas list");
        flash(req, "error", "Error al cargar reseñas.");
        res.redirect("/dashboard");
    }
});

// GET /resenas/nueva
router.get("/nueva", checkUser, async (req, res) => {
    try {
        const [canchasResult, personasResult] = await Promise.all([
            canchasService.enlistar(),
            req.user.rol === 'admin' ? personasService.enlistar() : Promise.resolve({ ok: true, data: [] }),
        ]);
        
        const preselectedCancha = req.query.cancha || "";
        
        res.render("resenas/form", {
            title: "Nueva Reseña",
            isEdit: false,
            resena: null,
            canchas: (canchasResult?.ok && canchasResult?.data) ? canchasResult.data : [],
            personas: (personasResult?.ok && personasResult?.data) ? personasResult.data : [],
            preselectedCancha: preselectedCancha,
        });
    } catch (error) {
        flash(req, "error", "Error al cargar formulario.");
        res.redirect("/resenas");
    }
});

// POST /resenas/nueva
router.post("/nueva", checkUser, async (req, res) => {
    try {
        const payload = {
            ...req.body,
            calificacion: parseInt(req.body.calificacion),
        };
        
        // Si es cliente, forzar su propio usuario_id
        if (req.user.rol === 'cliente') {
            payload.usuario_id = req.user.id;
        }

        const result = await resenasService.crear(payload);
        if (!result?.ok) {
            flash(req, "error", result?.message || "Error al crear reseña.");
            return res.redirect("/resenas/nueva");
        }

        flash(req, "success", "Reseña publicada exitosamente.");
        res.redirect("/resenas");
    } catch (error) {
        flash(req, "error", extractError(error));
        res.redirect("/resenas/nueva");
    }
});

// GET /resenas/:id/editar
router.get("/:id/editar", checkUser, async (req, res) => {
    try {
        const result = await resenasService.obtenerPorId(req.params.id);
        if (!result?.ok) {
            flash(req, "error", "Reseña no encontrada.");
            return res.redirect("/resenas");
        }
        
        const resena = result.data;
        
        // Verificar permisos
        if (req.user.rol !== 'admin' && resena.usuario_id !== req.user.id) {
            flash(req, "error", "No tienes permiso para editar esta reseña.");
            return res.redirect("/resenas");
        }
        
        const [canchasResult, personasResult] = await Promise.all([
            canchasService.enlistar(),
            req.user.rol === 'admin' ? personasService.enlistar() : Promise.resolve({ ok: true, data: [] }),
        ]);
        
        res.render("resenas/form", {
            title: "Editar Reseña",
            isEdit: true,
            resena: resena,
            canchas: (canchasResult?.ok && canchasResult?.data) ? canchasResult.data : [],
            personas: (personasResult?.ok && personasResult?.data) ? personasResult.data : [],
        });
    } catch (error) {
        flash(req, "error", "Error al cargar reseña.");
        res.redirect("/resenas");
    }
});

// POST /resenas/:id/editar
router.post("/:id/editar", checkUser, async (req, res) => {
    try {
        // Verificar permisos
        const resenaResult = await resenasService.obtenerPorId(req.params.id);
        if (!resenaResult?.ok) {
            flash(req, "error", "Reseña no encontrada.");
            return res.redirect("/resenas");
        }
        
        const resena = resenaResult.data;
        if (req.user.rol !== 'admin' && resena.usuario_id !== req.user.id) {
            flash(req, "error", "No tienes permiso para editar esta reseña.");
            return res.redirect("/resenas");
        }
        
        const payload = {
            ...req.body,
            calificacion: parseInt(req.body.calificacion),
        };
        
        if (req.user.rol === 'cliente') {
            payload.usuario_id = req.user.id;
        }
        
        const result = await resenasService.modificar(req.params.id, payload);
        if (!result?.ok) {
            flash(req, "error", result?.message || "Error al actualizar reseña.");
            return res.redirect(`/resenas/${req.params.id}/editar`);
        }

        flash(req, "success", "Reseña actualizada exitosamente.");
        res.redirect("/resenas");
    } catch (error) {
        flash(req, "error", extractError(error));
        res.redirect(`/resenas/${req.params.id}/editar`);
    }
});

// GET /resenas/:id/eliminar
router.get("/:id/eliminar", checkUser, async (req, res) => {
    try {
        // Verificar permisos
        const resenaResult = await resenasService.obtenerPorId(req.params.id);
        if (!resenaResult?.ok) {
            flash(req, "error", "Reseña no encontrada.");
            return res.redirect("/resenas");
        }
        
        const resena = resenaResult.data;
        if (req.user.rol !== 'admin' && resena.usuario_id !== req.user.id) {
            flash(req, "error", "No tienes permiso para eliminar esta reseña.");
            return res.redirect("/resenas");
        }
        
        await resenasService.eliminar(req.params.id);
        flash(req, "success", "Reseña eliminada exitosamente.");
    } catch (error) {
        flash(req, "error", "Error al eliminar reseña.");
    }
    res.redirect("/resenas");
});

module.exports = router;
