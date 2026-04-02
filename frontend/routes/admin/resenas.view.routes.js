const { createAdminModuleViewRouter } = require("./create-admin-module-view-router");

function createResenasAdminViewRouter() {
    return createAdminModuleViewRouter("resenas");
}

module.exports = {
    createResenasAdminViewRouter,
};
