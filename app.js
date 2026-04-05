const express = require("express");
const path = require("path");
const session = require("express-session");
const pinoHttp = require("pino-http");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");

const logger = require("./logs/logger");
const modules = require("./modules");
const routes = require("./routes");

const app = express();

function normalizeBasePath(basePath) {
    if (typeof basePath !== "string") {
        return "";
    }

    const trimmedBasePath = basePath.trim();

    if (trimmedBasePath === "") {
        return "";
    }

    return trimmedBasePath.startsWith("/") ? trimmedBasePath : `/${trimmedBasePath}`;
}

app.disable("x-powered-by");

app.use(
    pinoHttp({
        logger,
        genReqId: (req) => req.headers["x-request-id"] || Date.now().toString(),
    })
);

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:"],
                fontSrc: ["'self'", "https:", "data:"],
                connectSrc: ["'self'"],
            },
        },
    })
);

app.use(
    session({
        secret: process.env.SESSION_SECRET || "change-me-in-production",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
        },
    })
);

app.use(compression());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/front", express.static(path.join(__dirname, "public")));

// ==================== EJS Configuration ====================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ==================== Global View Helpers ====================
app.use((req, res, next) => {
    // Usuario y path siempre disponibles
    res.locals.user = req.session?.user || null;
    res.locals.currentPath = req.path;
    
    // Flash messages: siempre definidos (null por defecto)
    const flashData = req.session?.flash || {};
    res.locals.error = flashData.error || null;
    res.locals.success = flashData.success || null;
    res.locals.flash = flashData; // Para compatibilidad con vistas que usan flash.success
    
    // Limpiar flash de la sesión después de leerlo
    if (req.session?.flash) {
        req.session.flash = null;
        req.session.save();
    }
    
    next();
});

// ==================== Views Router (SSR - EJS Puro) ====================
app.use("/", routes);

app.get("/health", (_req, res) => {
    return res.status(200).json({
        ok: true,
        message: "Servidor funcionando correctamente",
    });
});

app.use((req, _res, next) => {
    req.log.info({ method: req.method, url: req.originalUrl }, "REQUEST HIT");
    next();
});

for (const moduleEntry of modules) {
    const basePath = normalizeBasePath(moduleEntry?.basePath);

    if (!basePath || !moduleEntry?.router) {
        logger.warn({ moduleEntry }, "MODULE SKIPPED");
        continue;
    }

    logger.info({ mountPath: `/api${basePath}` }, "MODULE MOUNTED");
    app.use(`/api${basePath}`, moduleEntry.router);
}

module.exports = app;
