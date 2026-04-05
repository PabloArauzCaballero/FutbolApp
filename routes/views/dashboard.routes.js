const express = require("express");
const router = express.Router();
const { checkUser } = require("../../middleware");
const canchasService = require("../../modules/canchas/canchas.service");
const reservasService = require("../../modules/reservas/reservas.service");
const resenasService = require("../../modules/resenas/resenas.service");
const personasService = require("../../modules/personas/personas.service");

// GET /dashboard
router.get("/", checkUser, async (req, res) => {
    try {
        // Stats
        const canchasResult = await canchasService.enlistar();
        const canchasTotal = (canchasResult?.ok && canchasResult?.data) ? canchasResult.data.length : 0;

        const reservasResult = await reservasService.enlistar();
        let misReservas = [];
        let todasReservas = [];
        
        if (reservasResult?.ok && reservasResult?.data) {
            todasReservas = reservasResult.data;
            misReservas = reservasResult.data.filter((r) => r.usuario_id === req.user.id);
        }

        const resenasResult = await resenasService.enlistar();
        const resenasTotal = (resenasResult?.ok && resenasResult?.data) ? resenasResult.data.length : 0;

        const personasResult = await personasService.enlistar();
        const usuariosTotal = (personasResult?.ok && personasResult?.data) ? personasResult.data.length : 0;

        res.render("dashboard", {
            title: "Dashboard",
            stats: {
                canchas: canchasTotal,
                misReservas: misReservas.length,
                resenas: resenasTotal,
                usuarios: usuariosTotal,
                todasReservas: todasReservas.length,
            },
            ultimasReservas: misReservas.slice(-5).reverse(),
        });
    } catch (error) {
        req.log.error({ err: error }, "Error dashboard");
        res.render("dashboard", {
            title: "Dashboard",
            stats: { canchas: 0, misReservas: 0, resenas: 0, usuarios: 0, todasReservas: 0 },
            ultimasReservas: [],
        });
    }
});

module.exports = router;
