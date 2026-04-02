(function () {
    const context = window.__CLIENT_CONTEXT__ || {};
    const userId = Number(context.userId);
    const limit = Number(context.defaultLimit || 100);

    const feedback = document.getElementById("cliente-feedback");
    const pendientesList = document.getElementById("resenas-pendientes-list");
    const misResenasList = document.getElementById("mis-resenas-list");

    let reservas = [];
    let horarios = [];
    let canchas = [];
    let resenas = [];

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

    function getCanchaById(canchaId) {
        return canchas.find(function (cancha) {
            return Number(cancha.id) === Number(canchaId);
        }) || null;
    }

    function isHorarioPasado(horario) {
        if (!horario) {
            return false;
        }

        const endDateValue = String(horario.fecha) + "T" + String(horario.hora_fin);
        const endDate = new Date(endDateValue);
        return Number(endDate.getTime()) < Date.now();
    }

    function getCanchasPendientesParaResena() {
        const misReservasConfirmadas = reservas.filter(function (reserva) {
            return Number(reserva.usuario_id) === userId && reserva.estado === "confirmada";
        });

        const canchaIdsConResena = new Set(
            resenas
                .filter(function (resena) {
                    return Number(resena.usuario_id) === userId;
                })
                .map(function (resena) {
                    return Number(resena.cancha_id);
                })
        );

        const canchaPendienteMap = new Map();

        misReservasConfirmadas.forEach(function (reserva) {
            const horario = getHorarioById(reserva.horario_id);

            if (!isHorarioPasado(horario)) {
                return;
            }

            const canchaId = Number(horario.cancha_id);

            if (canchaIdsConResena.has(canchaId)) {
                return;
            }

            if (!canchaPendienteMap.has(canchaId)) {
                canchaPendienteMap.set(canchaId, {
                    canchaId: canchaId,
                    canchaNombre: (getCanchaById(canchaId) || {}).nombre || "Cancha " + canchaId,
                    fecha: horario.fecha,
                });
            }
        });

        return Array.from(canchaPendienteMap.values());
    }

    function renderPendientes() {
        const pendientes = getCanchasPendientesParaResena();

        if (!pendientes.length) {
            pendientesList.innerHTML = '<p class="text-muted mb-0">No tienes reseñas pendientes.</p>';
            return;
        }

        pendientesList.innerHTML = pendientes.map(function (item) {
            return ''
                + '<form class="border rounded p-3 mb-3" data-action="crear-resena" data-cancha-id="' + item.canchaId + '">'
                + '  <h3 class="h6 mb-1">' + item.canchaNombre + "</h3>"
                + '  <p class="text-muted small mb-3">Reserva finalizada desde: ' + item.fecha + "</p>"
                + '  <div class="mb-2">'
                + '      <label class="form-label">Calificación</label>'
                + '      <select class="form-select" name="calificacion" required>'
                + '          <option value="5">5</option>'
                + '          <option value="4">4</option>'
                + '          <option value="3">3</option>'
                + '          <option value="2">2</option>'
                + '          <option value="1">1</option>'
                + "      </select>"
                + "  </div>"
                + '  <div class="mb-3">'
                + '      <label class="form-label">Comentario</label>'
                + '      <textarea class="form-control" name="comentario" rows="3" minlength="3" maxlength="500" required></textarea>'
                + "  </div>"
                + '  <button type="submit" class="btn btn-primary btn-sm">Guardar reseña</button>'
                + "</form>";
        }).join("");
    }

    function renderMisResenas() {
        const misResenas = resenas
            .filter(function (resena) {
                return Number(resena.usuario_id) === userId;
            })
            .sort(function (a, b) {
                return Number(b.id) - Number(a.id);
            });

        if (!misResenas.length) {
            misResenasList.innerHTML = '<p class="text-muted mb-0">Todavía no registraste reseñas.</p>';
            return;
        }

        misResenasList.innerHTML = misResenas.map(function (resena) {
            const cancha = getCanchaById(resena.cancha_id);
            return ''
                + '<div class="border rounded p-3 mb-2">'
                + '  <div class="d-flex justify-content-between align-items-center mb-1">'
                + '      <strong>' + ((cancha || {}).nombre || ("Cancha " + resena.cancha_id)) + "</strong>"
                + '      <span class="badge bg-primary">' + resena.calificacion + "/5</span>"
                + "  </div>"
                + "  <p class=\"mb-0\">" + resena.comentario + "</p>"
                + "</div>";
        }).join("");
    }

    async function cargarDatos() {
        const responses = await Promise.all([
            fetchJson("/api/reservas?offset=0&limit=" + limit),
            fetchJson("/api/horarios?offset=0&limit=" + limit),
            fetchJson("/api/canchas?offset=0&limit=" + limit),
            fetchJson("/api/resenas?offset=0&limit=" + limit),
        ]);

        reservas = responses[0]?.data?.items || [];
        horarios = responses[1]?.data?.items || [];
        canchas = responses[2]?.data?.items || [];
        resenas = responses[3]?.data?.items || [];

        renderPendientes();
        renderMisResenas();
    }

    pendientesList.addEventListener("submit", async function (event) {
        const form = event.target.closest('form[data-action="crear-resena"]');
        if (!form) {
            return;
        }

        event.preventDefault();
        hideFeedback();

        const canchaId = Number(form.dataset.canchaId);
        const calificacion = Number(form.calificacion.value);
        const comentario = String(form.comentario.value || "").trim();

        try {
            await fetchJson("/api/resenas", {
                method: "POST",
                body: JSON.stringify({
                    usuario_id: userId,
                    cancha_id: canchaId,
                    calificacion: calificacion,
                    comentario: comentario,
                }),
            });

            showFeedback("Reseña guardada correctamente.", "success");
            await cargarDatos();
        } catch (error) {
            showFeedback(error.message || "No se pudo guardar la reseña.");
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
            showFeedback(error.message || "No se pudieron cargar tus reseñas.");
        }
    });
})();
