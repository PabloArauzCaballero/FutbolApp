const frontendConfig = {
    appName: "Futbol App",
    brand: "Futbol App",
    loginPath: "/login",
    logoutPath: "/api/auth/logout",
    homePath: "/dashboard",
    defaultListLimit: 100,
    adminPages: [
        { key: "tipoCancha", title: "Tipos de cancha", href: "/admin/tipoCancha", view: "admin/tipo-cancha", script: "/public/js/admin-tipo-cancha.js" },
        { key: "canchas", title: "Canchas", href: "/admin/canchas", view: "admin/canchas", script: "/public/js/admin-canchas.js" },
        { key: "horarios", title: "Horarios", href: "/admin/horarios", view: "admin/horarios", script: "/public/js/admin-horarios.js" },
        { key: "personas", title: "Usuarios", href: "/admin/personas", view: "admin/personas", script: "/public/js/admin-personas.js" },
        { key: "reservas", title: "Reservas", href: "/admin/reservas", view: "admin/reservas", script: "/public/js/admin-reservas.js" },
        { key: "resenas", title: "Reseñas", href: "/admin/resenas", view: "admin/resenas", script: "/public/js/admin-resenas.js" },
    ],
    clientPages: [
        { key: "cliente-canchas", title: "Canchas", href: "/cliente/canchas" },
        { key: "cliente-reservas", title: "Mis reservas", href: "/cliente/reservas" },
        { key: "cliente-resenas", title: "Mis reseñas", href: "/cliente/resenas" },
    ],
};

function getAdminModuleConfigByKey(moduleKey) {
    return frontendConfig.adminPages.find((page) => page.key === moduleKey) || null;
}

function getAdminNavigationItems() {
    return frontendConfig.adminPages.map((page) => ({
        key: page.key,
        title: page.title,
        href: page.href,
    }));
}

function getClientNavigationItems() {
    return frontendConfig.clientPages;
}

module.exports = {
    frontendConfig,
    getAdminModuleConfigByKey,
    getAdminNavigationItems,
    getClientNavigationItems,
};
