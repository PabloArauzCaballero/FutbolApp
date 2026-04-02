(function () {
    const limit = 100;
    const feedback = document.getElementById("admin-feedback");
    const form = document.getElementById("form-resenas");
    const idInput = document.getElementById("resena-id");
    const usuarioInput = document.getElementById("resena-usuario");
    const canchaInput = document.getElementById("resena-cancha");
    const calificacionInput = document.getElementById("resena-calificacion");
    const comentarioInput = document.getElementById("resena-comentario");
    const cancelarBtn = document.getElementById("cancelar-edicion-resenas");
    const body = document.getElementById("tabla-resenas-body");

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

    function llenarSelect(select, data, labelKey) {
        select.innerHTML = data.map((item) => `<option value="${item.id}">${item.id} - ${item[labelKey]}</option>`).join("");
    }

    function renderTabla() {
        if (!items.length) {
            body.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-3">No hay registros.</td></tr>';
            return;
        }

        body.innerHTML = items.map((item) => `
            <tr>
                <td>${item.id}</td>
                <td>${item.usuario_id}</td>
                <td>${item.cancha_id}</td>
                <td>${item.calificacion}</td>
                <td>${item.comentario}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" data-action="editar" data-id="${item.id}">Editar</button>
                    <button class="btn btn-sm btn-outline-danger" data-action="eliminar" data-id="${item.id}">Eliminar</button>
                </td>
            </tr>
        `).join("");
    }

    async function cargar() {
        const [resenasRes, personasRes, canchasRes] = await Promise.all([
            fetchJson(`/api/resenas?offset=0&limit=${limit}`),
            fetchJson(`/api/personas?offset=0&limit=${limit}`),
            fetchJson(`/api/canchas?offset=0&limit=${limit}`),
        ]);
        items = resenasRes.data?.items || [];
        llenarSelect(usuarioInput, personasRes.data?.items || [], "email");
        llenarSelect(canchaInput, canchasRes.data?.items || [], "nombre");
        renderTabla();
    }

    async function guardar(event) {
        event.preventDefault();
        const id = idInput.value;
        const payload = {
            usuario_id: Number(usuarioInput.value),
            cancha_id: Number(canchaInput.value),
            calificacion: Number(calificacionInput.value),
            comentario: comentarioInput.value.trim(),
        };

        if (id) {
            await fetchJson(`/api/resenas/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
            showFeedback("Reseña actualizada.", "success");
        } else {
            await fetchJson("/api/resenas", { method: "POST", body: JSON.stringify(payload) });
            showFeedback("Reseña creada.", "success");
        }

        limpiarFormulario();
        await cargar();
    }

    function editar(id) {
        const item = items.find((row) => Number(row.id) === Number(id));
        if (!item) return;
        idInput.value = item.id;
        usuarioInput.value = String(item.usuario_id);
        canchaInput.value = String(item.cancha_id);
        calificacionInput.value = item.calificacion;
        comentarioInput.value = item.comentario || "";
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function eliminar(id) {
        const ok = window.confirm("¿Eliminar esta reseña?");
        if (!ok) return;
        await fetchJson(`/api/resenas/${id}`, { method: "DELETE" });
        showFeedback("Reseña eliminada.", "success");
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
