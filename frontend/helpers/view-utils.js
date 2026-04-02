function toNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}

function toTime(value) {
    const normalized = String(value || "").trim();
    if (normalized.length === 5) {
        return `${normalized}:00`;
    }
    return normalized;
}

function toBoolean(value) {
    if (typeof value === "boolean") return value;
    const normalized = String(value || "").toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "si" || normalized === "sí";
}

function getErrorMessage(error) {
    return error?.message || "Ocurrió un error en la operación.";
}

function buildRedirect(path, message, type = "success") {
    const encodedMessage = encodeURIComponent(message);
    const encodedType = encodeURIComponent(type);
    return `${path}?msg=${encodedMessage}&type=${encodedType}`;
}

function getCurrentUser(req) {
    return req.session?.user || null;
}

function ensureClienteUser(req) {
    return {
        userId: Number(req.session?.user?.id),
    };
}

function combineDateAndTime(dateValue, timeValue) {
    const dateText = String(dateValue || "").trim();
    const timeText = String(timeValue || "").trim();

    if (!dateText || !timeText) {
        return null;
    }

    const normalizedTime = timeText.length === 5 ? `${timeText}:00` : timeText;
    const parsed = new Date(`${dateText}T${normalizedTime}`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isPastHorario(horario) {
    const horarioEnd = combineDateAndTime(horario?.fecha, horario?.hora_fin);
    if (!horarioEnd) return false;
    return horarioEnd.getTime() < Date.now();
}

module.exports = {
    toNumber,
    toTime,
    toBoolean,
    getErrorMessage,
    buildRedirect,
    getCurrentUser,
    ensureClienteUser,
    combineDateAndTime,
    isPastHorario,
};
