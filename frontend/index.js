const frontendConfig = {
    appName: "Futbol App",
    brand: "Futbol App",
    loginPath: "/login",
    logoutPath: "/api/auth/logout",
    homePath: "/dashboard",
    defaultListLimit: 100,
    adminModules: [
        {
            key: "tipoCancha",
            title: "Tipos de cancha",
            description: "Administra los tipos disponibles para las canchas.",
            viewBasePath: "/admin/tipoCancha",
            apiBasePath: "/api/tipoCancha",
            primaryKey: "id",
            createApiPath: "/api/tipoCancha",
            updateApiPath: "/api/tipoCancha/:id",
            deleteApiPath: "/api/tipoCancha/:id",
            listApiPath: "/api/tipoCancha",
            tableColumns: [
                { key: "id", label: "ID" },
                { key: "nombre", label: "Nombre" },
            ],
            formFields: [
                { name: "nombre", label: "Nombre", type: "text", required: true, placeholder: "Ej. Futbol 7" },
            ],
        },
        {
            key: "canchas",
            title: "Canchas",
            description: "Crea y administra las canchas registradas.",
            viewBasePath: "/admin/canchas",
            apiBasePath: "/api/canchas",
            primaryKey: "id",
            createApiPath: "/api/canchas",
            updateApiPath: "/api/canchas/:id",
            deleteApiPath: "/api/canchas/:id",
            listApiPath: "/api/canchas",
            tableColumns: [
                { key: "id", label: "ID" },
                { key: "nombre", label: "Nombre" },
                { key: "tipo_id", label: "Tipo ID" },
                { key: "precio_por_hora", label: "Precio/Hora" },
                { key: "estado", label: "Estado" },
            ],
            formFields: [
                { name: "nombre", label: "Nombre", type: "text", required: true, placeholder: "Ej. Cancha Central" },
                {
                    name: "tipo_id",
                    label: "Tipo de cancha",
                    type: "select",
                    required: true,
                    dataSource: {
                        url: "/api/tipoCancha?offset=0&limit=100",
                        responsePath: "data.items",
                        valueKey: "id",
                        labelKey: "nombre",
                    },
                },
                { name: "precio_por_hora", label: "Precio por hora", type: "number", required: true, step: "0.01", min: "0" },
                {
                    name: "estado",
                    label: "Estado",
                    type: "select",
                    required: true,
                    options: [
                        { value: "activa", label: "Activa" },
                        { value: "inactiva", label: "Inactiva" },
                    ],
                },
            ],
        },
        {
            key: "horarios",
            title: "Horarios",
            description: "Administra los horarios de disponibilidad.",
            viewBasePath: "/admin/horarios",
            apiBasePath: "/api/horarios",
            primaryKey: "id",
            createApiPath: "/api/horarios",
            updateApiPath: "/api/horarios/:id",
            deleteApiPath: "/api/horarios/:id",
            listApiPath: "/api/horarios",
            tableColumns: [
                { key: "id", label: "ID" },
                { key: "cancha_id", label: "Cancha ID" },
                { key: "fecha", label: "Fecha" },
                { key: "hora_inicio", label: "Hora inicio" },
                { key: "hora_fin", label: "Hora fin" },
                { key: "disponible", label: "Disponible" },
            ],
            formFields: [
                {
                    name: "cancha_id",
                    label: "Cancha",
                    type: "select",
                    required: true,
                    dataSource: {
                        url: "/api/canchas?offset=0&limit=100",
                        responsePath: "data.items",
                        valueKey: "id",
                        labelKey: "nombre",
                    },
                },
                { name: "fecha", label: "Fecha", type: "date", required: true },
                { name: "hora_inicio", label: "Hora inicio", type: "time", required: true },
                { name: "hora_fin", label: "Hora fin", type: "time", required: true },
                {
                    name: "disponible",
                    label: "Disponible",
                    type: "select",
                    required: true,
                    options: [
                        { value: "true", label: "Si" },
                        { value: "false", label: "No" },
                    ],
                },
            ],
        },
        {
            key: "personas",
            title: "Usuarios",
            description: "Gestiona los usuarios del sistema. La creacion usa el modulo de registro.",
            viewBasePath: "/admin/personas",
            apiBasePath: "/api/personas",
            primaryKey: "id",
            createApiPath: "/api/auth/register",
            updateApiPath: "/api/personas/:id",
            deleteApiPath: "/api/personas/:id",
            listApiPath: "/api/personas",
            tableColumns: [
                { key: "id", label: "ID" },
                { key: "nombre", label: "Nombre" },
                { key: "email", label: "Correo" },
                { key: "rol", label: "Rol" },
            ],
            formFields: [
                { name: "nombre", label: "Nombre", type: "text", required: true },
                { name: "email", label: "Correo", type: "email", required: true },
                { name: "contrasena", label: "Contrasena", type: "password", required: true, onlyOnCreate: true },
                {
                    name: "rol",
                    label: "Rol",
                    type: "select",
                    required: true,
                    options: [
                        { value: "admin", label: "Admin" },
                        { value: "cliente", label: "Cliente" },
                    ],
                },
            ],
        },
        {
            key: "reservas",
            title: "Reservas",
            description: "Administra las reservas registradas.",
            viewBasePath: "/admin/reservas",
            apiBasePath: "/api/reservas",
            primaryKey: "id",
            createApiPath: "/api/reservas",
            updateApiPath: "/api/reservas/:id",
            deleteApiPath: "/api/reservas/:id",
            listApiPath: "/api/reservas",
            tableColumns: [
                { key: "id", label: "ID" },
                { key: "usuario_id", label: "Usuario ID" },
                { key: "horario_id", label: "Horario ID" },
                { key: "estado", label: "Estado" },
            ],
            formFields: [
                {
                    name: "usuario_id",
                    label: "Usuario",
                    type: "select",
                    required: true,
                    dataSource: {
                        url: "/api/personas?offset=0&limit=100",
                        responsePath: "data.items",
                        valueKey: "id",
                        labelKey: "email",
                    },
                },
                {
                    name: "horario_id",
                    label: "Horario",
                    type: "select",
                    required: true,
                    dataSource: {
                        url: "/api/horarios?offset=0&limit=100",
                        responsePath: "data.items",
                        valueKey: "id",
                        labelKey: "id",
                    },
                },
                {
                    name: "estado",
                    label: "Estado",
                    type: "select",
                    required: true,
                    options: [
                        { value: "confirmada", label: "Confirmada" },
                        { value: "cancelada", label: "Cancelada" },
                    ],
                },
            ],
        },
        {
            key: "resenas",
            title: "Reseñas",
            description: "Gestiona las reseñas realizadas por los usuarios.",
            viewBasePath: "/admin/resenas",
            apiBasePath: "/api/resenas",
            primaryKey: "id",
            createApiPath: "/api/resenas",
            updateApiPath: "/api/resenas/:id",
            deleteApiPath: "/api/resenas/:id",
            listApiPath: "/api/resenas",
            tableColumns: [
                { key: "id", label: "ID" },
                { key: "usuario_id", label: "Usuario ID" },
                { key: "cancha_id", label: "Cancha ID" },
                { key: "calificacion", label: "Calificacion" },
                { key: "comentario", label: "Comentario" },
            ],
            formFields: [
                {
                    name: "usuario_id",
                    label: "Usuario",
                    type: "select",
                    required: true,
                    dataSource: {
                        url: "/api/personas?offset=0&limit=100",
                        responsePath: "data.items",
                        valueKey: "id",
                        labelKey: "email",
                    },
                },
                {
                    name: "cancha_id",
                    label: "Cancha",
                    type: "select",
                    required: true,
                    dataSource: {
                        url: "/api/canchas?offset=0&limit=100",
                        responsePath: "data.items",
                        valueKey: "id",
                        labelKey: "nombre",
                    },
                },
                { name: "calificacion", label: "Calificacion", type: "number", required: true, min: "1", max: "5", step: "1" },
                { name: "comentario", label: "Comentario", type: "textarea", required: true, rows: 4 },
            ],
        },
    ],
    clientPages: [
        { key: "cliente-canchas", title: "Canchas", href: "/cliente/canchas" },
        { key: "cliente-reservas", title: "Mis reservas", href: "/cliente/reservas" },
        { key: "cliente-resenas", title: "Mis reseñas", href: "/cliente/resenas" },
    ],
};

function getAdminModuleConfigByKey(moduleKey) {
    return frontendConfig.adminModules.find((moduleConfig) => moduleConfig.key === moduleKey) || null;
}

function getAdminNavigationItems() {
    return frontendConfig.adminModules.map((moduleConfig) => ({
        key: moduleConfig.key,
        title: moduleConfig.title,
        href: moduleConfig.viewBasePath,
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
