(function () {
    const limit = 100;
    const feedback = document.getElementById("admin-feedback");
    const form = document.getElementById("form-tipo-cancha");
    const idInput = document.getElementById("tipo-cancha-id");
    const nombreInput = document.getElementById("tipo-cancha-nombre");
    const cancelarBtn = document.getElementById("cancelar-edicion-tipo-cancha");
    const body = document.getElementById("tabla-tipo-cancha-body");

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
        if (!response.ok) {
            throw new Error(data.message || "Error en la solicitud.");
        }
        return data;
    }

    function limpiarFormulario() {
        idInput.value = "";
        nombreInput.value = "";
    }

    function renderTabla() {
        if (!items.length) {
            body.innerHTML = '<tr><td colspan="3" class="text-center text-muted py-3">No hay registros.</td></tr>';
            return;
        }

        body.innerHTML = items.map((item) => `
            <tr>
                <td>${item.id}</td>
                <td>${item.nombre}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" data-action="editar" data-id="${item.id}">Editar</button>
                    <button class="btn btn-sm btn-outline-danger" data-action="eliminar" data-id="${item.id}">Eliminar</button>
                </td>
            </tr>
        `).join("");
    }

    async function cargar() {
        const response = await fetchJson(`/api/tipoCancha?offset=0&limit=${limit}`);
        items = response.data?.items || [];
        renderTabla();
    }

    async function guardar(event) {
        event.preventDefault();
        const id = idInput.value;
        const payload = { nombre: nombreInput.value.trim() };

        if (!payload.nombre) {
            showFeedback("El nombre es obligatorio.");
            return;
        }

        if (id) {
            await fetchJson(`/api/tipoCancha/${id}`, {
                method: "PATCH",
                body: JSON.stringify(payload),
            });
            showFeedback("Tipo actualizado.", "success");
        } else {
            await fetchJson("/api/tipoCancha", {
                method: "POST",
                body: JSON.stringify(payload),
            });
            showFeedback("Tipo creado.", "success");
        }

        limpiarFormulario();
        await cargar();
    }

    function editar(id) {
        const item = items.find((row) => Number(row.id) === Number(id));
        if (!item) return;
        idInput.value = item.id;
        nombreInput.value = item.nombre || "";
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function eliminar(id) {
        const ok = window.confirm("¿Eliminar este registro?");
        if (!ok) return;
        await fetchJson(`/api/tipoCancha/${id}`, { method: "DELETE" });
        showFeedback("Tipo eliminado.", "success");
        await cargar();
        if (Number(idInput.value) === Number(id)) {
            limpiarFormulario();
        }
    }

    form.addEventListener("submit", async (event) => {
        hideFeedback();
        try {
            await guardar(event);
        } catch (error) {
            showFeedback(error.message);
        }
    });

    cancelarBtn.addEventListener("click", () => {
        limpiarFormulario();
    });

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
