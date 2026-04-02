const getService = require("../../modules/service");
const authService = require("../../modules/auth/auth.service");
const { toNumber, toTime, toBoolean } = require("../helpers/view-utils");

async function listItems(moduleName, limit = 500) {
    const service = getService(moduleName);
    const result = await service.listar({}, { offset: 0, limit });
    return result?.items || [];
}

function findEditItem(items, editId) {
    if (!editId) return null;
    return items.find((item) => Number(item.id) === Number(editId)) || null;
}

async function getAdminPageData(moduleKey, editId) {
    if (moduleKey === "tipoCancha") {
        const items = await listItems("TipoCancha");
        return {
            items,
            editItem: findEditItem(items, editId),
        };
    }

    if (moduleKey === "canchas") {
        const [canchas, tipos] = await Promise.all([
            listItems("Canchas"),
            listItems("TipoCancha"),
        ]);
        return {
            canchas,
            tipos,
            editItem: findEditItem(canchas, editId),
        };
    }

    if (moduleKey === "horarios") {
        const [horarios, canchas] = await Promise.all([
            listItems("Horarios"),
            listItems("Canchas"),
        ]);
        return {
            horarios,
            canchas,
            editItem: findEditItem(horarios, editId),
        };
    }

    if (moduleKey === "personas") {
        const personas = await listItems("Usuarios");
        return {
            personas,
            editItem: findEditItem(personas, editId),
        };
    }

    if (moduleKey === "reservas") {
        const [reservas, usuarios, horarios] = await Promise.all([
            listItems("Reservas"),
            listItems("Usuarios"),
            listItems("Horarios"),
        ]);
        return {
            reservas,
            usuarios,
            horarios,
            editItem: findEditItem(reservas, editId),
        };
    }

    if (moduleKey === "resenas") {
        const [resenas, usuarios, canchas] = await Promise.all([
            listItems("Resenas"),
            listItems("Usuarios"),
            listItems("Canchas"),
        ]);
        return {
            resenas,
            usuarios,
            canchas,
            editItem: findEditItem(resenas, editId),
        };
    }

    return {};
}

async function createAdminRecord(moduleKey, body) {
    if (moduleKey === "tipoCancha") {
        return getService("TipoCancha").crear({
            nombre: String(body.nombre || "").trim(),
        });
    }

    if (moduleKey === "canchas") {
        return getService("Canchas").crear({
            nombre: String(body.nombre || "").trim(),
            tipo_id: toNumber(body.tipo_id),
            precio_por_hora: toNumber(body.precio_por_hora),
            estado: String(body.estado || "").trim().toLowerCase(),
        });
    }

    if (moduleKey === "horarios") {
        return getService("Horarios").crear({
            cancha_id: toNumber(body.cancha_id),
            fecha: String(body.fecha || "").trim(),
            hora_inicio: toTime(body.hora_inicio),
            hora_fin: toTime(body.hora_fin),
            disponible: toBoolean(body.disponible),
        });
    }

    if (moduleKey === "personas") {
        const result = await authService.register({
            nombre: String(body.nombre || "").trim(),
            email: String(body.email || "").trim().toLowerCase(),
            contrasena: String(body.contrasena || ""),
            rol: String(body.rol || "").trim().toLowerCase(),
        });

        if (!result.ok) {
            throw new Error(result.message || "No se pudo crear el usuario.");
        }

        return result.data;
    }

    if (moduleKey === "reservas") {
        return getService("Reservas").crear({
            usuario_id: toNumber(body.usuario_id),
            horario_id: toNumber(body.horario_id),
            estado: String(body.estado || "").trim().toLowerCase(),
        });
    }

    if (moduleKey === "resenas") {
        return getService("Resenas").crear({
            usuario_id: toNumber(body.usuario_id),
            cancha_id: toNumber(body.cancha_id),
            calificacion: toNumber(body.calificacion),
            comentario: String(body.comentario || "").trim(),
        });
    }

    return null;
}

async function updateAdminRecord(moduleKey, id, body) {
    if (moduleKey === "tipoCancha") {
        return getService("TipoCancha").modificar(Number(id), {
            nombre: String(body.nombre || "").trim(),
        });
    }

    if (moduleKey === "canchas") {
        return getService("Canchas").modificar(Number(id), {
            nombre: String(body.nombre || "").trim(),
            tipo_id: toNumber(body.tipo_id),
            precio_por_hora: toNumber(body.precio_por_hora),
            estado: String(body.estado || "").trim().toLowerCase(),
        });
    }

    if (moduleKey === "horarios") {
        return getService("Horarios").modificar(Number(id), {
            cancha_id: toNumber(body.cancha_id),
            fecha: String(body.fecha || "").trim(),
            hora_inicio: toTime(body.hora_inicio),
            hora_fin: toTime(body.hora_fin),
            disponible: toBoolean(body.disponible),
        });
    }

    if (moduleKey === "personas") {
        return getService("Usuarios").modificar(Number(id), {
            nombre: String(body.nombre || "").trim(),
            email: String(body.email || "").trim().toLowerCase(),
            rol: String(body.rol || "").trim().toLowerCase(),
        });
    }

    if (moduleKey === "reservas") {
        return getService("Reservas").modificar(Number(id), {
            usuario_id: toNumber(body.usuario_id),
            horario_id: toNumber(body.horario_id),
            estado: String(body.estado || "").trim().toLowerCase(),
        });
    }

    if (moduleKey === "resenas") {
        return getService("Resenas").modificar(Number(id), {
            usuario_id: toNumber(body.usuario_id),
            cancha_id: toNumber(body.cancha_id),
            calificacion: toNumber(body.calificacion),
            comentario: String(body.comentario || "").trim(),
        });
    }

    return null;
}

async function deleteAdminRecord(moduleKey, id) {
    if (moduleKey === "tipoCancha") return getService("TipoCancha").eliminar(Number(id));
    if (moduleKey === "canchas") return getService("Canchas").eliminar(Number(id));
    if (moduleKey === "horarios") return getService("Horarios").eliminar(Number(id));
    if (moduleKey === "personas") return getService("Usuarios").eliminar(Number(id));
    if (moduleKey === "reservas") return getService("Reservas").eliminar(Number(id));
    if (moduleKey === "resenas") return getService("Resenas").eliminar(Number(id));
    return null;
}

module.exports = {
    getAdminPageData,
    createAdminRecord,
    updateAdminRecord,
    deleteAdminRecord,
};
