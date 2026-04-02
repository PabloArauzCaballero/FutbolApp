const router = require("./auth.router");
const viewRouter = require("./auth.view.routes");

module.exports = {
    basePath: "/auth",
    viewBasePath: "/login",
    router,
    viewRouter,
};
