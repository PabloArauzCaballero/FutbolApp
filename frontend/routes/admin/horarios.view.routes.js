const { createAdminModuleViewRouter } = require("./create-admin-module-view-router");

function createHorariosAdminViewRouter() {
    return createAdminModuleViewRouter("horarios");
}

module.exports = {
    createHorariosAdminViewRouter,
};
