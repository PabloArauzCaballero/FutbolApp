const router = require("./horarios.routes");
const viewRouter = require("./horarios.view.routes");

module.exports = {
    basePath: "/horarios",
    viewBasePath: "/horarios",
    router,
    viewRouter,
};
