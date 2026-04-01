function toSnakeCase(value = "") {
    return String(value)
        .trim()
        .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
        .replace(/[\s-]+/g, "_")
        .replace(/_+/g, "_")
        .toLowerCase();
}

function capitalizeFirstLetter(value = "") {
    if (!value) return "";
    return value.charAt(0).toUpperCase() + value.slice(1);
}

module.exports = {
    toSnakeCase,
    capitalizeFirstLetter
}