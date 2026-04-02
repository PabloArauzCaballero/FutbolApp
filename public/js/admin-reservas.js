(function () {
    const limit = 100;
    const feedback = document.getElementById("admin-feedback");
    const form = document.getElementById("form-reservas");
    const idInput = document.getElementById("reserva-id");
    const usuarioInput = document.getElementById("reserva-usuario");
    const horarioInput = document.getElementById("reserva-horario");
    const estadoInput = document.getElementById("reserva-estado");
    const cancelarBtn = document.getElementById("cancelar-edicion-reservas");
    const body = document.getElementById("tabla-reservas-body");

    let items = [];

    function showFeedback(message, type = "danger") {
        feedback.className = "alert alert-" + type;
        feedback.textContent = message;
        feedback.classList.remove("d-none");
    }

    function hideFeedback() {
        feedback.classList.add("d-none");
        feedback.textContent = "";
    }

    async function fetchJson(url, options = {}) {
        const response = await fetch(url, {
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            ...options,
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || "Error en la solicitud.");
        return data;
    }

    function limpiarFormulario() {
        idInput.value = "";
        form.reset();
        estadoInput.value = "confirmada";
    }

    function llenarSelect(select, data, labelKey) {
        select.innerHTML = data.map((item) => `<option value="${item.id}">${item.id} - ${item[labelKey]}</option>`).join("");
    }

    function renderTabla() {
        if (!items.length) {
            body.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-3">No hay registros.</td></tr>';
            return;
        }

        body.innerHTML = items.map((item) => `
            <tr>
                <td>${item.id}</td>
                <td>${item.usuario_id}</td>
                <td>${item.horario_id}</td>
                <td>${item.estado}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" data-action="editar" data-id="${item.id}">Editar</button>
                    <button class="btn btn-sm btn-outline-danger" data-action="eliminar" data-id="${item.id}">Eliminar</button>
                </td>
            </tr>
        `).join("");
    }

    async function cargar() {
        const [reservasRes, personasRes, horariosRes] = await Promise.all([
            fetchJson(`/api/reservas?offset=0&limit=${limit}`),
            fetchJson(`/api/personas?offset=0&limit=${limit}`),
            fetchJson(`/api/horarios?offset=0&limit=${limit}`),
        ]);
        items = reservasRes.data?.items || [];
        llenarSelect(usuarioInput, personasRes.data?.items || [], "email");
        llenarSelect(horarioInput, horariosRes.data?.items || [], "fecha");
        renderTabla();
    }

    async function guardar(event) {
        event.preventDefault();
        const id = idInput.value;
        const payload = {
            usuario_id: Number(usuarioInput.value),
            horario_id: Number(horarioInput.value),
            estado: estadoInput.value,
        };

        if (id) {
            await fetchJson(`/api/reservas/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
            showFeedback("Reserva actualizada.", "success");
        } else {
            await fetchJson("/api/reservas", { method: "POST", body: JSON.stringify(payload) });
            showFeedback("Reserva creada.", "success");
        }

        limpiarFormulario();
        await cargar();
    }

    function editar(id) {
        const item = items.find((row) => Number(row.id) === Number(id));
        if (!item) return;
        idInput.value = item.id;
        usuarioInput.value = String(item.usuario_id);
        horarioInput.value = String(item.horario_id);
        estadoInput.value = item.estado || "confirmada";
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function eliminar(id) {
        const ok = window.confirm("¿Eliminar esta reserva?");
        if (!ok) return;
        await fetchJson(`/api/reservas/${id}`, { method: "DELETE" });
        showFeedback("Reserva eliminada.", "success");
        await cargar();
        if (Number(idInput.value) === Number(id)) limpiarFormulario();
    }

    form.addEventListener("submit", async (event) => {
        hideFeedback();
        try {
            await guardar(event);
        } catch (error) {
            showFeedback(error.message);
        }
    });

    cancelarBtn.addEventListener("click", limpiarFormulario);

    body.addEventListener("click", async (event) => {
        const button = event.target.closest("button[data-action]");
        if (!button) return;
        const { action, id } = button.dataset;
        hideFeedback();
        try {
            if (action === "editar") editar(id);
            if (action === "eliminar") await eliminar(id);
        } catch (error) {
            showFeedback(error.message);
        }
    });

    window.addEventListener("DOMContentLoaded", async () => {
        try {
            await cargar();
        } catch (error) {
            showFeedback(error.message);
        }
    });
})();
