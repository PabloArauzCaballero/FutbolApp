const express = require("express");
const router = express.Router();
const { checkUser, authorizeRoles } = require("../../middleware");
const reservasService = require("../../modules/reservas/reservas.service");
const horariosService = require("../../modules/horarios/horarios.service");
const canchasService = require("../../modules/canchas/canchas.service");
const personasService = require("../../modules/personas/personas.service");
const { flash, extractError } = require("./helpers");

// GET /reservas
router.get("/", checkUser, async (req, res) => {
    try {
        const result = await reservasService.enlistar();
        
        // Si es admin, ve todas. Si es cliente, solo las suyas
        const reservas = (result?.ok && result?.data)
            ? result.data.filter((r) => req.user.rol === 'admin' || r.usuario_id === req.user.id)
            : [];
            
        res.render("reservas/list", {
            title: req.user.rol === 'admin' ? "Todas las Reservas" : "Mis Reservas",
            reservas: reservas,
        });
    } catch (error) {
        req.log.error({ err: error }, "Error reservas list");
        flash(req, "error", "Error al cargar reservas.");
        res.redirect("/dashboard");
    }
});

// GET /reservas/nueva
router.get("/nueva", checkUser, async (req, res) => {
    try {
        const canchasResult = await canchasService.enlistar();
        const selectedCancha = req.query.cancha || "";
        
        // Todos los horarios disponibles para filtrar en cliente
        const horariosResult = await horariosService.enlistar({ disponible: true });
        
        res.render("reservas/create", {
            title: "Nueva Reserva",
            canchas: (canchasResult?.ok && canchasResult?.data) ? canchasResult.data : [],
            horarios: (horariosResult?.ok && horariosResult?.data) ? horariosResult.data : [],
            selectedCancha: selectedCancha,
        });
    } catch (error) {
        req.log.error({ err: error }, "Error reservas nueva");
        flash(req, "error", "Error al cargar formulario de reserva.");
        res.redirect("/reservas");
    }
});

// POST /reservas/nueva
router.post("/nueva", checkUser, async (req, res) => {
    try {
        const { cancha_id, horario_id } = req.body;

        const payload = {
            usuario_id: req.user.id,
            horario_id: horario_id,
            estado: "Confirmada",
        };

        const result = await reservasService.crear(payload);
        if (!result?.ok) {
            flash(req, "error", result?.message || "Error al crear reserva.");
            return res.redirect(`/reservas/nueva?cancha=${cancha_id || ""}`);
        }

        // Marcar horario como no disponible
        try {
            await horariosService.modificar(horario_id, { disponible: false });
        } catch (_) { }

        flash(req, "success", "Reserva creada exitosamente.");
        res.redirect("/reservas");
    } catch (error) {
        flash(req, "error", extractError(error));
        res.redirect("/reservas/nueva");
    }
});

// GET /reservas/:id
router.get("/:id", checkUser, async (req, res) => {
    try {
        const result = await reservasService.obtenerPorId(req.params.id);
        if (!result?.ok) {
            flash(req, "error", "Reserva no encontrada.");
            return res.redirect("/reservas");
        }
        
        const reserva = result.data;
        // Verificar que el usuario puede ver esta reserva
        if (req.user.rol !== 'admin' && reserva.usuario_id !== req.user.id) {
            flash(req, "error", "No tienes permiso para ver esta reserva.");
            return res.redirect("/reservas");
        }
        
        res.render("reservas/show", {
            title: `Reserva #${reserva.id}`,
            reserva: reserva,
        });
    } catch (error) {
        flash(req, "error", "Error al cargar reserva.");
        res.redirect("/reservas");
    }
});

// GET /reservas/:id/editar
router.get("/:id/editar", checkUser, async (req, res) => {
    try {
        const result = await reservasService.obtenerPorId(req.params.id);
        if (!result?.ok) {
            flash(req, "error", "Reserva no encontrada.");
            return res.redirect("/reservas");
        }
        
        const reserva = result.data;
        
        // Clientes solo pueden editar sus propias reservas
        if (req.user.rol !== 'admin' && reserva.usuario_id !== req.user.id) {
            flash(req, "error", "No tienes permiso para editar esta reserva.");
            return res.redirect("/reservas");
        }
        
        // Cargar datos necesarios para el form
        const [personasResult, horariosResult] = await Promise.all([
            req.user.rol === 'admin' ? personasService.enlistar() : Promise.resolve({ ok: true, data: [] }),
            horariosService.enlistar(),
        ]);
        
        res.render("reservas/edit", {
            title: "Editar Reserva",
            reserva: reserva,
            personas: (personasResult?.ok && personasResult?.data) ? personasResult.data : [],
            horarios: (horariosResult?.ok && horariosResult?.data) ? horariosResult.data : [],
        });
    } catch (error) {
        flash(req, "error", "Error al cargar formulario de edición.");
        res.redirect("/reservas");
    }
});

// POST /reservas/:id/editar
router.post("/:id/editar", checkUser, async (req, res) => {
    try {
        // Verificar permisos
        const reservaResult = await reservasService.obtenerPorId(req.params.id);
        if (!reservaResult?.ok) {
            flash(req, "error", "Reserva no encontrada.");
            return res.redirect("/reservas");
        }
        
        const reserva = reservaResult.data;
        if (req.user.rol !== 'admin' && reserva.usuario_id !== req.user.id) {
            flash(req, "error", "No tienes permiso para editar esta reserva.");
            return res.redirect("/reservas");
        }
        
        const result = await reservasService.modificar(req.params.id, req.body);
        if (!result?.ok) {
            flash(req, "error", result?.message || "Error al actualizar reserva.");
            return res.redirect(`/reservas/${req.params.id}/editar`);
        }
        
        // Si cambió el estado a Cancelada, liberar horario
        if (req.body.estado === 'Cancelada' && reserva.horario_id) {
            try {
                await horariosService.modificar(reserva.horario_id, { disponible: true });
            } catch (_) { }
        }
        
        flash(req, "success", "Reserva actualizada exitosamente.");
        res.redirect("/reservas");
    } catch (error) {
        flash(req, "error", extractError(error));
        res.redirect(`/reservas/${req.params.id}/editar`);
    }
});

// GET /reservas/:id/cancelar
router.get("/:id/cancelar", checkUser, async (req, res) => {
    try {
        // Verificar que la reserva pertenece al usuario
        const reservaResult = await reservasService.obtenerPorId(req.params.id);
        if (!reservaResult?.ok) {
            flash(req, "error", "Reserva no encontrada.");
            return res.redirect("/reservas");
        }

        const reserva = reservaResult.data;
        if (reserva.usuario_id !== req.user.id && req.user.rol !== "admin") {
            flash(req, "error", "No tienes permiso para cancelar esta reserva.");
            return res.redirect("/reservas");
        }

        // Cancelar reserva
        await reservasService.modificar(req.params.id, { estado: "Cancelada" });

        // Liberar el horario
        try {
            await horariosService.modificar(reserva.horario_id, { disponible: true });
        } catch (_) { }

        flash(req, "success", "Reserva cancelada exitosamente.");
    } catch (error) {
        flash(req, "error", "Error al cancelar reserva.");
    }
    res.redirect("/reservas");
});

module.exports = router;
