const express = require("express");
const { frontendConfig } = require("../index");

function createAuthViewRouter() {
    const router = express.Router();

    router.get("/", (req, res) => {
        if (req.session?.user) {
            return res.redirect(frontendConfig.homePath);
        }

        return res.render("auth/login", {
            appConfig: frontendConfig,
            currentUser: req.session?.user || null,
            pageTitle: "Acceso",
        });
    });

    return router;
}

module.exports = {
    createAuthViewRouter,
};
