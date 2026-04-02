const router = require("./canchas.routes");
const viewRouter = require("./canchas.view.routes");

module.exports = {
    basePath: "/canchas",
    viewBasePath: "/admin/canchas",
    router,
    viewRouter,
};
