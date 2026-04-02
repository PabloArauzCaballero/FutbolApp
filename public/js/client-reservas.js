(function () {
    const context = window.__CLIENT_CONTEXT__ || {};
    const userId = Number(context.userId);
    const limit = Number(context.defaultLimit || 100);

    const feedback = document.getElementById("cliente-feedback");
    const reservasBody = document.getElementById("reservas-body");
    const recargarButton = document.getElementById("recargar-reservas");

    let reservas = [];
    let horarios = [];

    function showFeedback(message, type) {
        feedback.className = "alert alert-" + (type || "danger");
        feedback.textContent = message;
        feedback.classList.remove("d-none");
    }

    function hideFeedback() {
        feedback.classList.add("d-none");
        feedback.textContent = "";
    }

    async function fetchJson(url, options) {
        const response = await fetch(url, {
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
            },
            ...(options || {}),
        });

        const data = await response.json().catch(function () {
            return {};
        });

        if (!response.ok) {
            throw new Error(data.message || "No se pudo completar la solicitud.");
        }

        return data;
    }

    function getHorarioById(horarioId) {
        return horarios.find(function (horario) {
            return Number(horario.id) === Number(horarioId);
        }) || null;
    }

    function renderReservas() {
        const misReservas = reservas
            .filter(function (reserva) {
                return Number(reserva.usuario_id) === userId;
            })
            .sort(function (a, b) {
                return Number(b.id) - Number(a.id);
            });

        if (!misReservas.length) {
            reservasBody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-3">No tienes reservas registradas.</td></tr>';
            return;
        }

        reservasBody.innerHTML = misReservas.map(function (reserva) {
            const horario = getHorarioById(reserva.horario_id);
            const puedeCancelar = reserva.estado === "confirmada";
            const badgeClass = reserva.estado === "confirmada" ? "bg-success" : "bg-secondary";
            const fecha = horario ? horario.fecha : "No disponible";
            const inicio = horario ? horario.hora_inicio : "-";
            const fin = horario ? horario.hora_fin : "-";

            return ''
                + "<tr>"
                + "  <td>" + reserva.id + "</td>"
                + "  <td>" + reserva.horario_id + "</td>"
                + "  <td>" + fecha + "</td>"
                + "  <td>" + inicio + "</td>"
                + "  <td>" + fin + "</td>"
                + '  <td><span class="badge ' + badgeClass + '">' + reserva.estado + "</span></td>"
                + '  <td><button class="btn btn-sm btn-outline-danger" data-action="cancelar-reserva" data-reserva-id="' + reserva.id + '" data-horario-id="' + reserva.horario_id + '" ' + (puedeCancelar ? "" : "disabled") + '>Cancelar</button></td>'
                + "</tr>";
        }).join("");
    }

    async function cargarDatos() {
        const responses = await Promise.all([
            fetchJson("/api/reservas?offset=0&limit=" + limit),
            fetchJson("/api/horarios?offset=0&limit=" + limit),
        ]);

        reservas = responses[0]?.data?.items || [];
        horarios = responses[1]?.data?.items || [];
        renderReservas();
    }

    async function cancelarReserva(reservaId, horarioId) {
        const accepted = window.confirm("¿Seguro que deseas cancelar esta reserva?");
        if (!accepted) {
            return;
        }

        await fetchJson("/api/reservas/" + reservaId, {
            method: "PATCH",
            body: JSON.stringify({ estado: "cancelada" }),
        });

        await fetchJson("/api/horarios/" + horarioId, {
            method: "PATCH",
            body: JSON.stringify({ disponible: true }),
        });

        showFeedback("Reserva cancelada correctamente.", "success");
        await cargarDatos();
    }

    reservasBody.addEventListener("click", async function (event) {
        const button = event.target.closest('[data-action="cancelar-reserva"]');
        if (!button) {
            return;
        }

        hideFeedback();

        try {
            await cancelarReserva(button.dataset.reservaId, button.dataset.horarioId);
        } catch (error) {
            showFeedback(error.message || "No se pudo cancelar la reserva.");
        }
    });

    recargarButton.addEventListener("click", async function () {
        hideFeedback();
        try {
            await cargarDatos();
            showFeedback("Datos recargados.", "info");
        } catch (error) {
            showFeedback(error.message || "No se pudieron recargar las reservas.");
        }
    });

    window.addEventListener("DOMContentLoaded", async function () {
        hideFeedback();

        if (!Number.isFinite(userId)) {
            showFeedback("No se pudo identificar al usuario autenticado.");
            return;
        }

        try {
            await cargarDatos();
        } catch (error) {
            showFeedback(error.message || "No se pudieron cargar las reservas.");
        }
    });
})();
