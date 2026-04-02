const express = require("express");
const crypto = require("crypto");
const session = require("express-session");
const modules = require("./modules");
const path = require("path");
const { frontendConfig } = require("./frontend");
const app = express();
const { serverLogger } = require("./logs");
const { checkUser } = require("./middlewares/check-user");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

function createOptionalMiddleware(packageName, fallbackFactory = () => (_req, _res, next) => next()) {
    try {
        return require(packageName);
    } catch (_error) {
        return fallbackFactory;
    }
}

const cors = createOptionalMiddleware("cors");
const helmet = createOptionalMiddleware("helmet");
const compression = createOptionalMiddleware("compression");

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

app.use(helmet());
app.use(compression());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static(path.join(__dirname, "public")));
app.use((req, _res, next) => {
    req.startTime = Date.now();
    req.requestId = req.headers["x-request-id"] || crypto.randomUUID();
    req.traceId = req.headers["x-trace-id"] || req.requestId;
    next();
});

app.use(session({
    secret: process.env.SESSION_SECRET || "beb36f16-96df-437f-bc65-e76c0c638c8b",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "lax",
    },
}));

app.use((req, res, next) => {
    res.locals.currentUser = req.session?.user || null;
    next();
});

app.get("/", (req, res) => {
    if (req.session?.user) {
        return res.redirect(frontendConfig.homePath);
    }

    return res.redirect(frontendConfig.loginPath);
});

app.get("/health", (_req, res) => {
    return res.status(200).json({
        ok: true,
        message: "Servidor funcionando correctamente",
    });
});

app.use((req, _res, next) => {
    console.log("REQUEST HIT =>", req.method, req.originalUrl);
    next();
});

for (const moduleEntry of modules) {
    const basePath = normalizeBasePath(moduleEntry?.basePath);
    const viewBasePath = normalizeBasePath(moduleEntry?.viewBasePath);

    if (viewBasePath && moduleEntry?.viewRouter) {
        console.log("VIEW MODULE MOUNTED =>", viewBasePath);
        if (basePath !== "/auth") {
            app.use(viewBasePath, checkUser, moduleEntry.viewRouter);
        } else {
            app.use(viewBasePath, moduleEntry.viewRouter);
        }
    }

    if (!basePath || !moduleEntry?.router) {
        console.log("MODULE SKIPPED =>", moduleEntry);
        continue;
    }

    console.log("MODULE MOUNTED =>", `/api${basePath}`);

    if (basePath !== "/auth") {
        app.use(`/api${basePath}`, checkUser, moduleEntry.router);
    } else {
        app.use(`/api${basePath}`, moduleEntry.router);
    }
}

app.use((req, res) => {
    serverLogger.warn({
        event: "route_not_found",
        message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
        module: "server",
        action: "http_request",
        statusHttp: 404,
        success: false,
        errorCode: "ROUTE_NOT_FOUND",
        requestId: req.requestId || "",
        traceId: req.traceId || "",
        durationMs: req.startTime ? Date.now() - req.startTime : 0,
        meta: {
            method: req.method,
            route: req.originalUrl,
            ip: req.ip,
        },
    });

    if (req.accepts(["html", "json"]) === "html") {
        return res.status(404).render("shared/index", {
            moduleName: "404",
        });
    }

    return res.status(404).json({
        ok: false,
        message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
        requestId: req.requestId || "",
    });
});

app.use((err, req, res, _next) => {
    const statusCode = Number.isInteger(err?.statusCode)
        ? err.statusCode
        : 500;

    const isServerError = statusCode >= 500;
    const publicMessage = isServerError
        ? "Error interno del servidor"
        : (err?.message || "Error en la solicitud");

    serverLogger.error({
        event: "express_global_error",
        message: err?.message || "Unhandled server error",
        module: "server",
        action: "http_request",
        statusHttp: statusCode,
        requestId: req.requestId || "",
        traceId: req.traceId || "",
        durationMs: req.startTime ? Date.now() - req.startTime : 0,
        success: false,
        errorCode: err?.code || err?.name || "UNHANDLED_ERROR",
        meta: {
            method: req.method,
            route: req.originalUrl,
            ip: req.ip,
            userId: req.user?.id || null,
            stack: process.env.NODE_ENV !== "production" ? err?.stack : undefined,
        },
    });

    if (req.accepts(["html", "json"]) === "html") {
        return res.status(statusCode).render("shared/index", {
            moduleName: publicMessage,
        });
    }

    return res.status(statusCode).json({
        ok: false,
        message: publicMessage,
        requestId: req.requestId || "",
    });
});

module.exports = app;
