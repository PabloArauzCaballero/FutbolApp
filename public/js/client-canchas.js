(function () {
    const context = window.__CLIENT_CONTEXT__ || {};
    const userId = Number(context.userId);
    const limit = Number(context.defaultLimit || 100);

    const feedback = document.getElementById("cliente-feedback");
    const canchasList = document.getElementById("canchas-list");
    const horariosTitle = document.getElementById("horarios-title");
    const horariosSubtitle = document.getElementById("horarios-subtitle");
    const horariosBody = document.getElementById("horarios-body");
    const filtroFecha = document.getElementById("filtro-fecha");
    const resenasCanchaList = document.getElementById("resenas-cancha-list");

    let canchas = [];
    let tipos = [];
    let horarios = [];
    let resenas = [];
    let canchaSeleccionadaId = null;

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

    function getTipoNombre(tipoId) {
        const tipo = tipos.find(function (item) {
            return Number(item.id) === Number(tipoId);
        });
        return tipo ? tipo.nombre : "Sin tipo";
    }

    function renderCanchas() {
        if (!canchas.length) {
            canchasList.innerHTML = '<div class="col-12 text-muted">No hay canchas registradas.</div>';
            return;
        }

        canchasList.innerHTML = canchas.map(function (cancha) {
            const activa = cancha.estado === "activa";
            const badgeClass = activa ? "bg-success" : "bg-secondary";
            const buttonDisabled = activa ? "" : "disabled";
            const tipoNombre = getTipoNombre(cancha.tipo_id);

            return ''
                + '<div class="col-md-6 col-xl-4 mb-3">'
                + '  <div class="card h-100 shadow-sm">'
                + '    <div class="card-body">'
                + '      <h3 class="h5 card-title mb-2">' + cancha.nombre + '</h3>'
                + '      <p class="mb-1"><strong>Tipo:</strong> ' + tipoNombre + "</p>"
                + '      <p class="mb-2"><strong>Precio/hora:</strong> Bs. ' + cancha.precio_por_hora + "</p>"
                + '      <span class="badge ' + badgeClass + '">' + cancha.estado + "</span>"
                + "    </div>"
                + '    <div class="card-footer bg-white">'
                + '      <button class="btn btn-primary btn-sm" data-action="seleccionar-cancha" data-cancha-id="' + cancha.id + '" ' + buttonDisabled + '>Ver horarios</button>'
                + "    </div>"
                + "  </div>"
                + "</div>";
        }).join("");
    }

    function renderResenasCancha(canchaId) {
        const canchaResenas = resenas.filter(function (resena) {
            return Number(resena.cancha_id) === Number(canchaId);
        });

        if (!canchaResenas.length) {
            resenasCanchaList.innerHTML = '<p class="text-muted mb-0">Esta cancha todavía no tiene reseñas.</p>';
            return;
        }

        resenasCanchaList.innerHTML = canchaResenas.map(function (resena) {
            return ''
                + '<div class="border rounded p-3 mb-2">'
                + '  <div class="mb-1"><strong>Calificación:</strong> ' + resena.calificacion + "/5</div>"
                + '  <p class="mb-0">' + resena.comentario + "</p>"
                + "</div>";
        }).join("");
    }

    function getHorariosFiltrados() {
        let result = horarios.filter(function (horario) {
            return Number(horario.cancha_id) === Number(canchaSeleccionadaId) && Boolean(horario.disponible);
        });

        if (filtroFecha.value) {
            result = result.filter(function (horario) {
                return horario.fecha === filtroFecha.value;
            });
        }

        result.sort(function (a, b) {
            const aValue = String(a.fecha) + " " + String(a.hora_inicio);
            const bValue = String(b.fecha) + " " + String(b.hora_inicio);
            return aValue.localeCompare(bValue);
        });

        return result;
    }

    function renderHorarios() {
        if (!canchaSeleccionadaId) {
            horariosBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-3">Selecciona una cancha.</td></tr>';
            return;
        }

        const cancha = canchas.find(function (item) {
            return Number(item.id) === Number(canchaSeleccionadaId);
        });

        horariosTitle.textContent = "Horarios de " + (cancha ? cancha.nombre : "cancha");
        horariosSubtitle.textContent = "Selecciona un horario para reservar.";

        const horariosFiltrados = getHorariosFiltrados();

        if (!horariosFiltrados.length) {
            horariosBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-3">No hay horarios disponibles con ese filtro.</td></tr>';
            return;
        }

        horariosBody.innerHTML = horariosFiltrados.map(function (horario) {
            return ''
                + "<tr>"
                + "  <td>" + horario.id + "</td>"
                + "  <td>" + horario.fecha + "</td>"
                + "  <td>" + horario.hora_inicio + "</td>"
                + "  <td>" + horario.hora_fin + "</td>"
                + '  <td><span class="badge bg-success">Sí</span></td>'
                + '  <td><button class="btn btn-sm btn-primary" data-action="reservar-horario" data-horario-id="' + horario.id + '">Reservar</button></td>'
                + "</tr>";
        }).join("");
    }

    async function reservarHorario(horarioId) {
        if (!Number.isFinite(userId)) {
            showFeedback("No se pudo identificar al usuario autenticado.");
            return;
        }

        const accepted = window.confirm("¿Deseas confirmar esta reserva?");
        if (!accepted) {
            return;
        }

        await fetchJson("/api/reservas", {
            method: "POST",
            body: JSON.stringify({
                usuario_id: userId,
                horario_id: Number(horarioId),
                estado: "confirmada",
            }),
        });

        await fetchJson("/api/horarios/" + horarioId, {
            method: "PATCH",
            body: JSON.stringify({ disponible: false }),
        });

        horarios = horarios.map(function (item) {
            if (Number(item.id) === Number(horarioId)) {
                return { ...item, disponible: false };
            }
            return item;
        });

        renderHorarios();
        showFeedback("Reserva creada correctamente.", "success");
    }

    async function cargarDatosIniciales() {
        const responses = await Promise.all([
            fetchJson("/api/canchas?offset=0&limit=" + limit),
            fetchJson("/api/tipoCancha?offset=0&limit=" + limit),
            fetchJson("/api/horarios?offset=0&limit=" + limit),
            fetchJson("/api/resenas?offset=0&limit=" + limit),
        ]);

        canchas = responses[0]?.data?.items || [];
        tipos = responses[1]?.data?.items || [];
        horarios = responses[2]?.data?.items || [];
        resenas = responses[3]?.data?.items || [];

        renderCanchas();
        renderHorarios();
    }

    canchasList.addEventListener("click", function (event) {
        const button = event.target.closest('[data-action="seleccionar-cancha"]');
        if (!button) {
            return;
        }

        canchaSeleccionadaId = Number(button.dataset.canchaId);
        renderHorarios();
        renderResenasCancha(canchaSeleccionadaId);
    });

    horariosBody.addEventListener("click", async function (event) {
        const button = event.target.closest('[data-action="reservar-horario"]');
        if (!button) {
            return;
        }

        hideFeedback();

        try {
            await reservarHorario(button.dataset.horarioId);
        } catch (error) {
            showFeedback(error.message || "No se pudo reservar el horario.");
        }
    });

    filtroFecha.addEventListener("change", function () {
        renderHorarios();
    });

    window.addEventListener("DOMContentLoaded", async function () {
        hideFeedback();

        try {
            await cargarDatosIniciales();
        } catch (error) {
            showFeedback(error.message || "No se pudieron cargar las canchas.");
        }
    });
})();
