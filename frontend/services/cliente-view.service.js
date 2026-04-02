const getService = require("../../modules/service");
const {
    isPastHorario,
} = require("../helpers/view-utils");

async function listItems(moduleName, limit = 500) {
    const service = getService(moduleName);
    const result = await service.listar({}, { offset: 0, limit });
    return result?.items || [];
}

async function getClientBaseData() {
    const [canchas, tipos, horarios, reservas, resenas] = await Promise.all([
        listItems("Canchas"),
        listItems("TipoCancha"),
        listItems("Horarios"),
        listItems("Reservas"),
        listItems("Resenas"),
    ]);

    return {
        canchas,
        tipos,
        horarios,
        reservas,
        resenas,
    };
}

async function getClientCanchasPageData() {
    const { canchas, tipos } = await getClientBaseData();
    const tiposById = new Map(tipos.map((tipo) => [Number(tipo.id), tipo]));
    const canchasActivas = canchas.filter((cancha) => cancha.estado === "activa");

    return {
        canchas: canchasActivas,
        tiposById,
        selectedCancha: null,
        horariosDisponibles: [],
        resenasCancha: [],
        selectedFecha: "",
    };
}

async function getClientCanchaDetailData(canchaId, filterDate = "") {
    const { canchas, tipos, horarios, resenas } = await getClientBaseData();
    const tiposById = new Map(tipos.map((tipo) => [Number(tipo.id), tipo]));
    const canchasActivas = canchas.filter((cancha) => cancha.estado === "activa");
    const selectedCancha = canchasActivas.find((cancha) => Number(cancha.id) === Number(canchaId)) || null;

    if (!selectedCancha) {
        return {
            found: false,
            canchas: canchasActivas,
            tiposById,
            selectedCancha: null,
            horariosDisponibles: [],
            resenasCancha: [],
            selectedFecha: String(filterDate || ""),
        };
    }

    let horariosDisponibles = horarios.filter((horario) =>
        Number(horario.cancha_id) === Number(canchaId) && Boolean(horario.disponible)
    );

    if (filterDate) {
        horariosDisponibles = horariosDisponibles.filter((horario) => String(horario.fecha) === String(filterDate));
    }

    horariosDisponibles.sort((a, b) => {
        const aKey = `${a.fecha} ${a.hora_inicio}`;
        const bKey = `${b.fecha} ${b.hora_inicio}`;
        return aKey.localeCompare(bKey);
    });

    const resenasCancha = resenas.filter((resena) => Number(resena.cancha_id) === Number(canchaId));

    return {
        found: true,
        canchas: canchasActivas,
        tiposById,
        selectedCancha,
        horariosDisponibles,
        resenasCancha,
        selectedFecha: String(filterDate || ""),
    };
}

async function createClientReserva(userId, horarioId) {
    const horarioService = getService("Horarios");
    const reservaService = getService("Reservas");

    const horario = await horarioService.obtener(Number(horarioId));
    if (!horario || !horario.disponible) {
        throw new Error("El horario ya no está disponible.");
    }

    await reservaService.crear({
        usuario_id: Number(userId),
        horario_id: Number(horarioId),
        estado: "confirmada",
    });

    await horarioService.modificar(Number(horarioId), { disponible: false });
}

async function getClientReservasData(userId) {
    const { reservas, horarios, canchas } = await getClientBaseData();

    const horariosById = new Map(horarios.map((horario) => [Number(horario.id), horario]));
    const canchasById = new Map(canchas.map((cancha) => [Number(cancha.id), cancha]));

    return reservas
        .filter((reserva) => Number(reserva.usuario_id) === Number(userId))
        .sort((a, b) => Number(b.id) - Number(a.id))
        .map((reserva) => {
            const horario = horariosById.get(Number(reserva.horario_id)) || null;
            const cancha = horario ? (canchasById.get(Number(horario.cancha_id)) || null) : null;
            return {
                ...reserva,
                horario,
                cancha,
            };
        });
}

async function cancelClientReserva(userId, reservaId) {
    const reservaService = getService("Reservas");
    const horarioService = getService("Horarios");

    const reserva = await reservaService.obtener(Number(reservaId));
    if (!reserva || Number(reserva.usuario_id) !== Number(userId)) {
        throw new Error("Reserva no encontrada.");
    }

    await reservaService.modificar(Number(reservaId), { estado: "cancelada" });
    await horarioService.modificar(Number(reserva.horario_id), { disponible: true });
}

async function getClientResenasData(userId) {
    const { reservas, horarios, canchas, resenas } = await getClientBaseData();

    const horariosById = new Map(horarios.map((horario) => [Number(horario.id), horario]));
    const canchasById = new Map(canchas.map((cancha) => [Number(cancha.id), cancha]));

    const misResenas = resenas
        .filter((resena) => Number(resena.usuario_id) === Number(userId))
        .map((resena) => ({
            ...resena,
            cancha: canchasById.get(Number(resena.cancha_id)) || null,
        }))
        .sort((a, b) => Number(b.id) - Number(a.id));

    const canchaIdsConResena = new Set(misResenas.map((resena) => Number(resena.cancha_id)));
    const pendientesMap = new Map();

    reservas.forEach((reserva) => {
        if (Number(reserva.usuario_id) !== Number(userId)) return;
        if (String(reserva.estado) !== "confirmada") return;

        const horario = horariosById.get(Number(reserva.horario_id));
        if (!horario || !isPastHorario(horario)) return;

        const canchaId = Number(horario.cancha_id);
        if (canchaIdsConResena.has(canchaId)) return;

        if (!pendientesMap.has(canchaId)) {
            pendientesMap.set(canchaId, {
                canchaId,
                cancha: canchasById.get(canchaId) || null,
                fecha: horario.fecha,
            });
        }
    });

    return {
        misResenas,
        resenasPendientes: Array.from(pendientesMap.values()),
    };
}

async function createClientResena(userId, payload) {
    await getService("Resenas").crear({
        usuario_id: Number(userId),
        cancha_id: Number(payload?.cancha_id),
        calificacion: Number(payload?.calificacion),
        comentario: String(payload?.comentario || "").trim(),
    });
}

module.exports = {
    getClientCanchasPageData,
    getClientCanchaDetailData,
    createClientReserva,
    getClientReservasData,
    cancelClientReserva,
    getClientResenasData,
    createClientResena,
};
