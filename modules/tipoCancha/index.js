const router = require("./tipoCancha.routes");
const viewRouter = require("./tipoCancha.view.routes");

module.exports = {
    basePath: "/tipoCancha",
    viewBasePath: "/tipoCancha",
    router,
    viewRouter,
};
