const { createAdminModuleViewRouter } = require("./create-admin-module-view-router");

function createTipoCanchaAdminViewRouter() {
    return createAdminModuleViewRouter("tipoCancha");
}

module.exports = {
    createTipoCanchaAdminViewRouter,
};
