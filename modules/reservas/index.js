const router = require("./reservas.routes");
const viewRouter = require("./reservas.view.routes");

module.exports = {
    basePath: "/reservas",
    viewBasePath: "/reservas",
    router,
    viewRouter,
};
