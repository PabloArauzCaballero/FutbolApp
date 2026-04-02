const router = require("./resenas.routes");
const viewRouter = require("./resenas.view.routes");

module.exports = {
    basePath: "/resenas",
    viewBasePath: "/admin/resenas",
    router,
    viewRouter,
};
