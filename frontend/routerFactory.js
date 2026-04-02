const express = require("express");

const { createAuthViewRouter: createAuthRoute } = require("./routes/auth.view.routes");
const { createDashboardViewRouter } = require("./routes/dashboard.view.routes");

const { createCanchasAdminViewRouter } = require("./routes/admin/canchas.view.routes");
const { createTipoCanchaAdminViewRouter } = require("./routes/admin/tipo-cancha.view.routes");
const { createHorariosAdminViewRouter } = require("./routes/admin/horarios.view.routes");
const { createPersonasAdminViewRouter } = require("./routes/admin/personas.view.routes");
const { createReservasAdminViewRouter } = require("./routes/admin/reservas.view.routes");
const { createResenasAdminViewRouter } = require("./routes/admin/resenas.view.routes");

const { createClienteCanchasViewRouter } = require("./routes/cliente/canchas.view.routes");
const { createClienteReservasViewRouter } = require("./routes/cliente/reservas.view.routes");
const { createClienteResenasViewRouter } = require("./routes/cliente/resenas.view.routes");

const adminRouterFactoryByModule = {
    canchas: createCanchasAdminViewRouter,
    tipoCancha: createTipoCanchaAdminViewRouter,
    horarios: createHorariosAdminViewRouter,
    personas: createPersonasAdminViewRouter,
    reservas: createReservasAdminViewRouter,
    resenas: createResenasAdminViewRouter,
};

function createCrudViewRouter(moduleKey) {
    const buildRouter = adminRouterFactoryByModule[moduleKey];

    if (!buildRouter) {
        throw new Error(`No existe configuración frontend para el módulo: ${moduleKey}`);
    }

    return buildRouter();
}

function createAuthViewRouter() {
    return createAuthRoute();
}

function createMainViewRouter() {
    const router = express.Router();

    router.use(createDashboardViewRouter());
    router.use(createClienteCanchasViewRouter());
    router.use(createClienteReservasViewRouter());
    router.use(createClienteResenasViewRouter());

    return router;
}

module.exports = {
    createCrudViewRouter,
    createAuthViewRouter,
    createMainViewRouter,
};
