/**
 * Helpers compartidos para rutas SSR
 */

function flash(req, type, message) {
    if (!req.session) return;
    req.session.flash = req.session.flash || {};
    req.session.flash[type] = message;
    req.session.save();
}

function clearFlash(req) {
    if (req.session && req.session.flash) {
        const f = req.session.flash;
        req.session.flash = null;
        req.session.save();
        return f;
    }
    return null;
}

function extractError(err) {
    if (err instanceof Error) return err.message;
    if (typeof err === "string") return err;
    if (err && err.message) return err.message;
    return "Error desconocido";
}

module.exports = {
    flash,
    clearFlash,
    extractError
};
