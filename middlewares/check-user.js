exports.checkUser = (req, res, next) => {
    const currentUser = req.session?.user || null;

    if (currentUser) {
        res.locals.currentUser = currentUser;
        return next();
    }

    const expectsHtml = req.accepts(["html", "json"]) === "html" && !req.originalUrl.startsWith("/api/");

    if (expectsHtml) {
        return res.redirect("/login");
    }

    return res.status(401).json({
        ok: false,
        message: "Debes iniciar sesión para continuar.",
    });
};
