const express = require("express");
const router = express.Router();

// Importar sub-routers de vistas
const authRouter = require("./views/auth.routes");
const dashboardRouter = require("./views/dashboard.routes");
const canchasRouter = require("./views/canchas.routes");
const tipoCanchaRouter = require("./views/tipoCancha.routes");
const horariosRouter = require("./views/horarios.routes");
const personasRouter = require("./views/personas.routes");
const reservasRouter = require("./views/reservas.routes");
const resenasRouter = require("./views/resenas.routes");

// Montar rutas
router.use("/", authRouter);           // /, /auth/*
router.use("/dashboard", dashboardRouter);
router.use("/canchas", canchasRouter);
router.use("/tipoCancha", tipoCanchaRouter);
router.use("/horarios", horariosRouter);
router.use("/personas", personasRouter);
router.use("/reservas", reservasRouter);
router.use("/resenas", resenasRouter);

module.exports = router;
