(function () {
    const limit = 100;
    const feedback = document.getElementById("admin-feedback");
    const form = document.getElementById("form-canchas");
    const idInput = document.getElementById("cancha-id");
    const nombreInput = document.getElementById("cancha-nombre");
    const tipoInput = document.getElementById("cancha-tipo");
    const precioInput = document.getElementById("cancha-precio");
    const estadoInput = document.getElementById("cancha-estado");
    const cancelarBtn = document.getElementById("cancelar-edicion-canchas");
    const body = document.getElementById("tabla-canchas-body");

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
    }

    function llenarTipos(tipos) {
        tipoInput.innerHTML = tipos.map((tipo) => `<option value="${tipo.id}">${tipo.id} - ${tipo.nombre}</option>`).join("");
    }

    function renderTabla() {
        if (!items.length) {
            body.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-3">No hay registros.</td></tr>';
            return;
        }

        body.innerHTML = items.map((item) => `
            <tr>
                <td>${item.id}</td>
                <td>${item.nombre}</td>
                <td>${item.tipo_id}</td>
                <td>${item.precio_por_hora}</td>
                <td>${item.estado}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" data-action="editar" data-id="${item.id}">Editar</button>
                    <button class="btn btn-sm btn-outline-danger" data-action="eliminar" data-id="${item.id}">Eliminar</button>
                </td>
            </tr>
        `).join("");
    }

    async function cargar() {
        const [canchasRes, tiposRes] = await Promise.all([
            fetchJson(`/api/canchas?offset=0&limit=${limit}`),
            fetchJson(`/api/tipoCancha?offset=0&limit=${limit}`),
        ]);
        items = canchasRes.data?.items || [];
        llenarTipos(tiposRes.data?.items || []);
        renderTabla();
    }

    async function guardar(event) {
        event.preventDefault();
        const id = idInput.value;
        const payload = {
            nombre: nombreInput.value.trim(),
            tipo_id: Number(tipoInput.value),
            precio_por_hora: Number(precioInput.value),
            estado: estadoInput.value,
        };

        if (id) {
            await fetchJson(`/api/canchas/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
            showFeedback("Cancha actualizada.", "success");
        } else {
            await fetchJson("/api/canchas", { method: "POST", body: JSON.stringify(payload) });
            showFeedback("Cancha creada.", "success");
        }

        limpiarFormulario();
        await cargar();
    }

    function editar(id) {
        const item = items.find((row) => Number(row.id) === Number(id));
        if (!item) return;
        idInput.value = item.id;
        nombreInput.value = item.nombre || "";
        tipoInput.value = String(item.tipo_id);
        precioInput.value = item.precio_por_hora;
        estadoInput.value = item.estado || "activa";
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function eliminar(id) {
        const ok = window.confirm("¿Eliminar esta cancha?");
        if (!ok) return;
        await fetchJson(`/api/canchas/${id}`, { method: "DELETE" });
        showFeedback("Cancha eliminada.", "success");
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
