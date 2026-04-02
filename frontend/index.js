const frontendConfig = {
    appName: "Futbol App",
    brand: "Futbol App",
    loginPath: "/login",
    logoutPath: "/api/auth/logout",
    homePath: "/dashboard",
    defaultListLimit: 100,
    adminPages: [
        { key: "tipoCancha", title: "Tipos de cancha", href: "/admin/tipoCancha", view: "admin/tipo-cancha" },
        { key: "canchas", title: "Canchas", href: "/admin/canchas", view: "admin/canchas" },
        { key: "horarios", title: "Horarios", href: "/admin/horarios", view: "admin/horarios" },
        { key: "personas", title: "Usuarios", href: "/admin/personas", view: "admin/personas" },
        { key: "reservas", title: "Reservas", href: "/admin/reservas", view: "admin/reservas" },
        { key: "resenas", title: "Reseñas", href: "/admin/resenas", view: "admin/resenas" },
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
