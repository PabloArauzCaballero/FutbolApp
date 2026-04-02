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
    getClientResenasData,
    createClientResena,
} = require("../../services/cliente-view.service");

function createClienteResenasViewRouter() {
    const router = express.Router();

    router.get("/cliente/resenas", requireRole("cliente"), async (req, res, next) => {
        try {
            const { userId } = ensureClienteUser(req);
            const { misResenas, resenasPendientes } = await getClientResenasData(userId);

            return res.render("cliente/resenas", {
                appConfig: frontendConfig,
                navigationItems: getClientNavigationItems(),
                currentUser: getCurrentUser(req),
                currentPath: "/cliente/resenas",
                pageTitle: "Mis reseñas",
                feedback: {
                    message: req.query.msg || "",
                    type: req.query.type || "info",
                },
                misResenas,
                resenasPendientes,
            });
        } catch (error) {
            return next(error);
        }
    });

    router.post("/cliente/resenas/create", requireRole("cliente"), async (req, res) => {
        try {
            const { userId } = ensureClienteUser(req);
            await createClientResena(userId, req.body || {});
            return res.redirect(buildRedirect("/cliente/resenas", "Reseña creada correctamente."));
        } catch (error) {
            return res.redirect(buildRedirect("/cliente/resenas", getErrorMessage(error), "danger"));
        }
    });

    return router;
}

module.exports = {
    createClienteResenasViewRouter,
};
