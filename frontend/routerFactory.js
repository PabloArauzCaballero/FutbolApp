const express = require('express');
const { frontendConfig, getModuleConfigByKey, getNavigationItems } = require('./index');

function createCrudViewRouter(moduleKey) {
    const router = express.Router();
    const moduleConfig = getModuleConfigByKey(moduleKey);

    if (!moduleConfig) {
        throw new Error(`No existe configuración frontend para el módulo: ${moduleKey}`);
    }

    router.get('/', (req, res) => {
        return res.render('crud/page', {
            appConfig: frontendConfig,
            navigationItems: getNavigationItems(),
            pageConfig: moduleConfig,
            currentUser: req.session?.user || null,
        });
    });

    return router;
}

function createAuthViewRouter() {
    const router = express.Router();

    router.get('/', (req, res) => {
        if (req.session?.user) {
            return res.redirect(frontendConfig.homePath);
        }

        return res.render('auth/login', {
            appConfig: frontendConfig,
            navigationItems: getNavigationItems(),
            currentUser: req.session?.user || null,
        });
    });

    return router;
}

module.exports = {
    createCrudViewRouter,
    createAuthViewRouter,
};
