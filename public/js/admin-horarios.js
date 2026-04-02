(function () {
    const limit = 100;
    const feedback = document.getElementById("admin-feedback");
    const form = document.getElementById("form-horarios");
    const idInput = document.getElementById("horario-id");
    const canchaInput = document.getElementById("horario-cancha");
    const fechaInput = document.getElementById("horario-fecha");
    const inicioInput = document.getElementById("horario-inicio");
    const finInput = document.getElementById("horario-fin");
    const disponibleInput = document.getElementById("horario-disponible");
    const cancelarBtn = document.getElementById("cancelar-edicion-horarios");
    const body = document.getElementById("tabla-horarios-body");

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
        disponibleInput.value = "true";
    }

    function llenarCanchas(canchas) {
        canchaInput.innerHTML = canchas.map((cancha) => `<option value="${cancha.id}">${cancha.id} - ${cancha.nombre}</option>`).join("");
    }

    function renderTabla() {
        if (!items.length) {
            body.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-3">No hay registros.</td></tr>';
            return;
        }

        body.innerHTML = items.map((item) => `
            <tr>
                <td>${item.id}</td>
                <td>${item.cancha_id}</td>
                <td>${item.fecha}</td>
                <td>${item.hora_inicio}</td>
                <td>${item.hora_fin}</td>
                <td>${item.disponible ? "Sí" : "No"}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" data-action="editar" data-id="${item.id}">Editar</button>
                    <button class="btn btn-sm btn-outline-danger" data-action="eliminar" data-id="${item.id}">Eliminar</button>
                </td>
            </tr>
        `).join("");
    }

    async function cargar() {
        const [horariosRes, canchasRes] = await Promise.all([
            fetchJson(`/api/horarios?offset=0&limit=${limit}`),
            fetchJson(`/api/canchas?offset=0&limit=${limit}`),
        ]);
        items = horariosRes.data?.items || [];
        llenarCanchas(canchasRes.data?.items || []);
        renderTabla();
    }

    async function guardar(event) {
        event.preventDefault();
        const id = idInput.value;
        const payload = {
            cancha_id: Number(canchaInput.value),
            fecha: fechaInput.value,
            hora_inicio: inicioInput.value + ":00",
            hora_fin: finInput.value + ":00",
            disponible: disponibleInput.value === "true",
        };

        if (id) {
            await fetchJson(`/api/horarios/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
            showFeedback("Horario actualizado.", "success");
        } else {
            await fetchJson("/api/horarios", { method: "POST", body: JSON.stringify(payload) });
            showFeedback("Horario creado.", "success");
        }

        limpiarFormulario();
        await cargar();
    }

    function editar(id) {
        const item = items.find((row) => Number(row.id) === Number(id));
        if (!item) return;
        idInput.value = item.id;
        canchaInput.value = String(item.cancha_id);
        fechaInput.value = item.fecha || "";
        inicioInput.value = String(item.hora_inicio || "").slice(0, 5);
        finInput.value = String(item.hora_fin || "").slice(0, 5);
        disponibleInput.value = item.disponible ? "true" : "false";
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function eliminar(id) {
        const ok = window.confirm("¿Eliminar este horario?");
        if (!ok) return;
        await fetchJson(`/api/horarios/${id}`, { method: "DELETE" });
        showFeedback("Horario eliminado.", "success");
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
