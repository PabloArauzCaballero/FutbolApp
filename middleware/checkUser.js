module.exports = (req, res, next) => {
    const sessionUser = req.session?.user;

    if (!sessionUser) {
        return res.status(401).json({
            ok: false,
            message: "Debes iniciar sesión para acceder a este recurso.",
        });
    }

    req.user = sessionUser;
    res.locals.userEmail = sessionUser.email;
    res.locals.userId = sessionUser.id;
    res.locals.rol = sessionUser.rol;

    return next();
};
