const { createAdminModuleViewRouter } = require("./create-admin-module-view-router");

function createCanchasAdminViewRouter() {
    return createAdminModuleViewRouter("canchas");
}

module.exports = {
    createCanchasAdminViewRouter,
};
