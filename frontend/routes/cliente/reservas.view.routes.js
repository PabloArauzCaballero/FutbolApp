const express = require("express");
const { requireRole } = require("../../../middlewares/require-role");
const { frontendConfig, getClientNavigationItems } = require("../../index");
const {
    buildRedirect,
    ensureClienteUser,
    getCurrentUser,
    getErrorMessage,
} = require("../../helpers/view-utils");
const {
    getClientReservasData,
    cancelClientReserva,
} = require("../../services/cliente-view.service");

function createClienteReservasViewRouter() {
    const router = express.Router();

    router.get("/cliente/reservas", requireRole("cliente"), async (req, res, next) => {
        try {
            const { userId } = ensureClienteUser(req);
            const reservas = await getClientReservasData(userId);

            return res.render("cliente/reservas", {
                appConfig: frontendConfig,
                navigationItems: getClientNavigationItems(),
                currentUser: getCurrentUser(req),
                currentPath: "/cliente/reservas",
                pageTitle: "Mis reservas",
                feedback: {
                    message: req.query.msg || "",
                    type: req.query.type || "info",
                },
                reservas,
            });
        } catch (error) {
            return next(error);
        }
    });

    router.post("/cliente/reservas/:id/cancelar", requireRole("cliente"), async (req, res) => {
        try {
            const { userId } = ensureClienteUser(req);
            await cancelClientReserva(userId, Number(req.params.id));
            return res.redirect(buildRedirect("/cliente/reservas", "Reserva cancelada correctamente."));
        } catch (error) {
            return res.redirect(buildRedirect("/cliente/reservas", getErrorMessage(error), "danger"));
        }
    });

    return router;
}

module.exports = {
    createClienteReservasViewRouter,
};
