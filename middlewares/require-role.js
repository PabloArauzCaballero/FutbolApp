function requireRole(...allowedRoles) {
    const normalizedAllowedRoles = allowedRoles.map((role) => String(role).toLowerCase());

    return function roleMiddleware(req, res, next) {
        const currentUser = req.session?.user || null;
        const expectsHtml = req.accepts(["html", "json"]) === "html" && !req.originalUrl.startsWith("/api/");

        if (!currentUser) {
            if (expectsHtml) {
                return res.redirect("/login");
            }

            return res.status(401).json({
                ok: false,
                message: "Debes iniciar sesión para continuar.",
            });
        }

        const userRole = String(currentUser?.rol || "").toLowerCase();
        const canAccess = normalizedAllowedRoles.includes(userRole);

        if (canAccess) {
            return next();
        }

        if (expectsHtml) {
            return res.redirect("/dashboard");
        }

        return res.status(403).json({
            ok: false,
            message: "No tienes permisos para acceder a este recurso.",
        });
    };
}

module.exports = {
    requireRole,
};
