const express = require('express');
const {
    frontendConfig,
    getAdminModuleConfigByKey,
    getAdminNavigationItems,
    getClientNavigationItems,
} = require('./index');
const { requireRole } = require('../middlewares/require-role');

function createCrudViewRouter(moduleKey) {
    const router = express.Router();
    const moduleConfig = getAdminModuleConfigByKey(moduleKey);

    if (!moduleConfig) {
        throw new Error(`No existe configuración frontend para el módulo: ${moduleKey}`);
    }

    router.get('/', requireRole('admin'), (req, res) => {
        return res.render('admin/crud', {
            appConfig: frontendConfig,
            navigationItems: getAdminNavigationItems(),
            pageConfig: moduleConfig,
            currentUser: req.session?.user || null,
            currentPath: moduleConfig.viewBasePath,
            pageTitle: moduleConfig.title,
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
            currentUser: req.session?.user || null,
            pageTitle: 'Acceso',
        });
    });

    return router;
}

function createMainViewRouter() {
    const router = express.Router();

    function getCurrentUser(req) {
        return req.session?.user || null;
    }

    router.get('/canchas', (req, res) => {
        const currentUser = getCurrentUser(req);

        if (!currentUser) {
            return res.redirect('/login');
        }

        if (currentUser.rol === 'admin') {
            return res.redirect('/admin/canchas');
        }

        return res.redirect('/cliente/canchas');
    });

    router.get('/reservas', (req, res) => {
        const currentUser = getCurrentUser(req);

        if (!currentUser) {
            return res.redirect('/login');
        }

        if (currentUser.rol === 'admin') {
            return res.redirect('/admin/reservas');
        }

        return res.redirect('/cliente/reservas');
    });

    router.get('/resenas', (req, res) => {
        const currentUser = getCurrentUser(req);

        if (!currentUser) {
            return res.redirect('/login');
        }

        if (currentUser.rol === 'admin') {
            return res.redirect('/admin/resenas');
        }

        return res.redirect('/cliente/resenas');
    });

    router.get('/tipoCancha', requireRole('admin'), (_req, res) => {
        return res.redirect('/admin/tipoCancha');
    });

    router.get('/horarios', requireRole('admin'), (_req, res) => {
        return res.redirect('/admin/horarios');
    });

    router.get('/personas', requireRole('admin'), (_req, res) => {
        return res.redirect('/admin/personas');
    });

    router.get('/dashboard', (req, res) => {
        if (!req.session?.user) {
            return res.redirect('/login');
        }

        const userRole = req.session?.user?.rol;

        if (userRole === 'admin') {
            return res.redirect('/admin/tipoCancha');
        }

        return res.redirect('/cliente/canchas');
    });

    router.get('/cliente', requireRole('cliente'), (_req, res) => {
        return res.redirect('/cliente/canchas');
    });

    router.get('/cliente/canchas', requireRole('cliente'), (req, res) => {
        return res.render('cliente/canchas', {
            appConfig: frontendConfig,
            navigationItems: getClientNavigationItems(),
            currentUser: req.session?.user || null,
            currentPath: '/cliente/canchas',
            pageTitle: 'Canchas disponibles',
        });
    });

    router.get('/cliente/reservas', requireRole('cliente'), (req, res) => {
        return res.render('cliente/reservas', {
            appConfig: frontendConfig,
            navigationItems: getClientNavigationItems(),
            currentUser: req.session?.user || null,
            currentPath: '/cliente/reservas',
            pageTitle: 'Mis reservas',
        });
    });

    router.get('/cliente/resenas', requireRole('cliente'), (req, res) => {
        return res.render('cliente/resenas', {
            appConfig: frontendConfig,
            navigationItems: getClientNavigationItems(),
            currentUser: req.session?.user || null,
            currentPath: '/cliente/resenas',
            pageTitle: 'Mis reseñas',
        });
    });

    return router;
}

module.exports = {
    createCrudViewRouter,
    createAuthViewRouter,
    createMainViewRouter,
};
