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
    getClientCanchasPageData,
    getClientCanchaDetailData,
    createClientReserva,
} = require("../../services/cliente-view.service");

function createClienteCanchasViewRouter() {
    const router = express.Router();

    router.get("/cliente", requireRole("cliente"), (_req, res) => {
        return res.redirect("/cliente/canchas");
    });

    router.get("/cliente/canchas", requireRole("cliente"), async (req, res, next) => {
        try {
            const pageData = await getClientCanchasPageData();

            return res.render("cliente/canchas", {
                appConfig: frontendConfig,
                navigationItems: getClientNavigationItems(),
                currentUser: getCurrentUser(req),
                currentPath: "/cliente/canchas",
                pageTitle: "Canchas disponibles",
                feedback: {
                    message: req.query.msg || "",
                    type: req.query.type || "info",
                },
                ...pageData,
            });
        } catch (error) {
            return next(error);
        }
    });

    router.get("/cliente/canchas/:id", requireRole("cliente"), async (req, res, next) => {
        try {
            const canchaId = Number(req.params.id);
            const pageData = await getClientCanchaDetailData(canchaId, req.query.fecha || "");

            if (!pageData.found) {
                return res.redirect(buildRedirect("/cliente/canchas", "Cancha no encontrada o inactiva.", "warning"));
            }

            return res.render("cliente/canchas", {
                appConfig: frontendConfig,
                navigationItems: getClientNavigationItems(),
                currentUser: getCurrentUser(req),
                currentPath: "/cliente/canchas",
                pageTitle: "Canchas disponibles",
                feedback: {
                    message: req.query.msg || "",
                    type: req.query.type || "info",
                },
                ...pageData,
            });
        } catch (error) {
            return next(error);
        }
    });

    router.post("/cliente/reservas/create", requireRole("cliente"), async (req, res) => {
        try {
            const { userId } = ensureClienteUser(req);
            await createClientReserva(userId, Number(req.body?.horario_id));
            return res.redirect(buildRedirect("/cliente/reservas", "Reserva creada correctamente."));
        } catch (error) {
            return res.redirect(buildRedirect("/cliente/canchas", getErrorMessage(error), "danger"));
        }
    });

    return router;
}

module.exports = {
    createClienteCanchasViewRouter,
};
