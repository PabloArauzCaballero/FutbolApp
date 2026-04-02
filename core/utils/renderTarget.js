function renderTarget(target = "shared/index", data = {}) {
    if (typeof target !== "string" || target.trim() === "") {
        throw new TypeError("El target debe ser un string válido.");
    }

    return function render(req, res, next) {
        try {
            const resolvedData =
                typeof data === "function"
                    ? data(req, res, next)
                    : data;

            return res.render(target, {
                ...res.locals,
                ...(resolvedData ?? {}),
            });
        } catch (error) {
            return next(error);
        }
    };
}

module.exports = { renderTarget };