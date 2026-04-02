const express = require("express");
const {
    frontendConfig,
    getAdminModuleConfigByKey,
    getAdminNavigationItems,
} = require("../../index");
const { requireRole } = require("../../../middlewares/require-role");
const {
    getErrorMessage,
    buildRedirect,
    getCurrentUser,
} = require("../../helpers/view-utils");
const {
    getAdminPageData,
    createAdminRecord,
    updateAdminRecord,
    deleteAdminRecord,
} = require("../../services/admin-view.service");

function createAdminModuleViewRouter(moduleKey) {
    const router = express.Router();
    const pageConfig = getAdminModuleConfigByKey(moduleKey);

    if (!pageConfig) {
        throw new Error(`No existe configuración frontend para el módulo: ${moduleKey}`);
    }

    router.get("/", requireRole("admin"), async (req, res, next) => {
        try {
            const pageData = await getAdminPageData(moduleKey, req.query.edit);

            return res.render(pageConfig.view, {
                appConfig: frontendConfig,
                navigationItems: getAdminNavigationItems(),
                currentUser: getCurrentUser(req),
                currentPath: pageConfig.href,
                pageTitle: pageConfig.title,
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

    router.post("/create", requireRole("admin"), async (req, res) => {
        try {
            await createAdminRecord(moduleKey, req.body || {});
            return res.redirect(buildRedirect(pageConfig.href, "Registro creado correctamente."));
        } catch (error) {
            return res.redirect(buildRedirect(pageConfig.href, getErrorMessage(error), "danger"));
        }
    });

    router.post("/update/:id", requireRole("admin"), async (req, res) => {
        try {
            await updateAdminRecord(moduleKey, req.params.id, req.body || {});
            return res.redirect(buildRedirect(pageConfig.href, "Registro actualizado correctamente."));
        } catch (error) {
            return res.redirect(buildRedirect(pageConfig.href, getErrorMessage(error), "danger"));
        }
    });

    router.post("/delete/:id", requireRole("admin"), async (req, res) => {
        try {
            await deleteAdminRecord(moduleKey, req.params.id);
            return res.redirect(buildRedirect(pageConfig.href, "Registro eliminado correctamente."));
        } catch (error) {
            return res.redirect(buildRedirect(pageConfig.href, getErrorMessage(error), "danger"));
        }
    });

    return router;
}

module.exports = {
    createAdminModuleViewRouter,
};
