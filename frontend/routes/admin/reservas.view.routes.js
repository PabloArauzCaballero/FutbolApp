const { createAdminModuleViewRouter } = require("./create-admin-module-view-router");

function createReservasAdminViewRouter() {
    return createAdminModuleViewRouter("reservas");
}

module.exports = {
    createReservasAdminViewRouter,
};
