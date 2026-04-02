const express = require("express");
const { requireRole } = require("../../middlewares/require-role");
const { getCurrentUser } = require("../helpers/view-utils");

function createDashboardViewRouter() {
    const router = express.Router();

    router.get("/canchas", (req, res) => {
        const currentUser = getCurrentUser(req);

        if (!currentUser) {
            return res.redirect("/login");
        }

        if (currentUser.rol === "admin") {
            return res.redirect("/admin/canchas");
        }

        return res.redirect("/cliente/canchas");
    });

    router.get("/reservas", (req, res) => {
        const currentUser = getCurrentUser(req);

        if (!currentUser) {
            return res.redirect("/login");
        }

        if (currentUser.rol === "admin") {
            return res.redirect("/admin/reservas");
        }

        return res.redirect("/cliente/reservas");
    });

    router.get("/resenas", (req, res) => {
        const currentUser = getCurrentUser(req);

        if (!currentUser) {
            return res.redirect("/login");
        }

        if (currentUser.rol === "admin") {
            return res.redirect("/admin/resenas");
        }

        return res.redirect("/cliente/resenas");
    });

    router.get("/tipoCancha", requireRole("admin"), (_req, res) => res.redirect("/admin/tipoCancha"));
    router.get("/horarios", requireRole("admin"), (_req, res) => res.redirect("/admin/horarios"));
    router.get("/personas", requireRole("admin"), (_req, res) => res.redirect("/admin/personas"));

    router.get("/dashboard", (req, res) => {
        const currentUser = getCurrentUser(req);

        if (!currentUser) {
            return res.redirect("/login");
        }

        if (currentUser.rol === "admin") {
            return res.redirect("/admin/tipoCancha");
        }

        return res.redirect("/cliente/canchas");
    });

    return router;
}

module.exports = {
    createDashboardViewRouter,
};
