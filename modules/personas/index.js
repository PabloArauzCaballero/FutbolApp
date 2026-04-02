const router = require("./personas.routes");
const viewRouter = require("./personas.view.routes");

module.exports = {
    basePath: "/personas",
    viewBasePath: "/personas",
    router,
    viewRouter,
};
