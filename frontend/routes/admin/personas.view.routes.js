const { createAdminModuleViewRouter } = require("./create-admin-module-view-router");

function createPersonasAdminViewRouter() {
    return createAdminModuleViewRouter("personas");
}

module.exports = {
    createPersonasAdminViewRouter,
};
