const express = require("express");
const router = express.Router();
const authService = require("../../modules/auth/auth.service");
const { flash } = require("./helpers");

// GET / -> redirect a login
router.get("/", (req, res) => {
    if (req.session?.user) {
        return res.redirect("/dashboard");
    }
    return res.redirect("/auth/login");
});

// GET /auth/login
router.get("/auth/login", (req, res) => {
    if (req.session?.user) {
        return res.redirect("/dashboard");
    }
    res.render("auth/login", {
        title: "Iniciar Sesión",
        email: req.query.email || "",
    });
});

// POST /auth/login
router.post("/auth/login", async (req, res) => {
    try {
        const { email, contrasena } = req.body;
        const result = await authService.login({ email, contrasena });

        if (!result?.ok) {
            flash(req, "error", result?.message || "Credenciales incorrectas.");
            return res.redirect(`/auth/login?email=${encodeURIComponent(email || "")}`);
        }

        req.session.user = {
            id: result.data.id,
            nombre: result.data.nombre,
            email: result.data.email,
            rol: result.data.rol,
        };
        await new Promise((resolve, reject) => {
            req.session.save((err) => (err ? reject(err) : resolve()));
        });

        req.log.info({ email, userId: result.data.id }, "Login vía vistas EJS");
        return res.redirect("/dashboard");
    } catch (error) {
        req.log.error({ err: error }, "Error login vistas");
        flash(req, "error", "Error interno del servidor.");
        return res.redirect("/auth/login");
    }
});

// GET /auth/register
router.get("/auth/register", (req, res) => {
    if (req.session?.user) {
        return res.redirect("/dashboard");
    }
    res.render("auth/register", {
        title: "Registro",
        prefill: req.session._prefill || {},
    });
    if (req.session._prefill) {
        req.session._prefill = null;
        req.session.save();
    }
});

// POST /auth/register
router.post("/auth/register", async (req, res) => {
    try {
        const { nombre, email, contrasena, rol } = req.body;
        const result = await authService.signup({ nombre, email, contrasena, rol: rol || "cliente" });

        if (!result?.ok) {
            flash(req, "error", result?.message || "Error al registrar usuario.");
            req.session._prefill = { nombre, email };
            req.session.save();
            return res.redirect("/auth/register");
        }

        flash(req, "success", "Cuenta creada exitosamente. Ahora inicia sesión.");
        return res.redirect("/auth/login");
    } catch (error) {
        req.log.error({ err: error }, "Error registro vistas");
        flash(req, "error", "Error interno del servidor.");
        return res.redirect("/auth/register");
    }
});

// POST /auth/logout
router.post("/auth/logout", (req, res) => {
    if (req.session) {
        req.session.destroy(() => {
            res.clearCookie("connect.sid");
            res.redirect("/auth/login");
        });
    } else {
        res.redirect("/auth/login");
    }
});

module.exports = router;
