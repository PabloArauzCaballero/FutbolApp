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

// Error 404 para rutas no encontradas
router.use((req, res) => {
    res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>404 - No Encontrado</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    background: #0a0a0a;
                    color: #e4e4e7;
                    font-family: system-ui, sans-serif;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    flex-direction: column;
                    margin: 0;
                }
                h1 { font-size: 4rem; color: #22c55e; margin: 0; }
                p { color: #71717a; margin-bottom: 1.5rem; }
                a { color: #22c55e; text-decoration: none; }
                a:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            <h1>404</h1>
            <p>Página no encontrada</p>
            <a href="/dashboard">Volver al Dashboard</a>
        </body>
        </html>
    `);
});

module.exports = router;
