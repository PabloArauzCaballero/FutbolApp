module.exports = (...allowedRoles) => {
    return (req, res, next) => {
        const sessionUser = req.user || req.session?.user;

        if (!sessionUser) {
            return res.status(401).json({
                ok: false,
                message: "Debes iniciar sesión para acceder a este recurso.",
            });
        }

        if (!allowedRoles.includes(sessionUser.rol)) {
            return res.status(403).json({
                ok: false,
                message: "No tienes permisos para realizar esta acción.",
            });
        }

        req.user = sessionUser;
        return next();
    };
};
