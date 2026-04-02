(function () {
    const limit = 100;
    const feedback = document.getElementById("admin-feedback");
    const form = document.getElementById("form-personas");
    const idInput = document.getElementById("persona-id");
    const nombreInput = document.getElementById("persona-nombre");
    const emailInput = document.getElementById("persona-email");
    const passwordInput = document.getElementById("persona-password");
    const rolInput = document.getElementById("persona-rol");
    const passwordWrapper = document.getElementById("persona-password-wrapper");
    const cancelarBtn = document.getElementById("cancelar-edicion-personas");
    const body = document.getElementById("tabla-personas-body");

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
        passwordInput.required = true;
        passwordWrapper.classList.remove("d-none");
    }

    function renderTabla() {
        if (!items.length) {
            body.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-3">No hay registros.</td></tr>';
            return;
        }

        body.innerHTML = items.map((item) => `
            <tr>
                <td>${item.id}</td>
                <td>${item.nombre || ""}</td>
                <td>${item.email}</td>
                <td>${item.rol}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" data-action="editar" data-id="${item.id}">Editar</button>
                    <button class="btn btn-sm btn-outline-danger" data-action="eliminar" data-id="${item.id}">Eliminar</button>
                </td>
            </tr>
        `).join("");
    }

    async function cargar() {
        const response = await fetchJson(`/api/personas?offset=0&limit=${limit}`);
        items = response.data?.items || [];
        renderTabla();
    }

    async function guardar(event) {
        event.preventDefault();
        const id = idInput.value;

        if (id) {
            const payload = {
                nombre: nombreInput.value.trim(),
                email: emailInput.value.trim(),
                rol: rolInput.value,
            };
            await fetchJson(`/api/personas/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
            showFeedback("Usuario actualizado.", "success");
        } else {
            const payload = {
                nombre: nombreInput.value.trim(),
                email: emailInput.value.trim(),
                contrasena: passwordInput.value,
                rol: rolInput.value,
            };
            await fetchJson("/api/auth/register", { method: "POST", body: JSON.stringify(payload) });
            showFeedback("Usuario creado.", "success");
        }

        limpiarFormulario();
        await cargar();
    }

    function editar(id) {
        const item = items.find((row) => Number(row.id) === Number(id));
        if (!item) return;
        idInput.value = item.id;
        nombreInput.value = item.nombre || "";
        emailInput.value = item.email || "";
        rolInput.value = item.rol || "cliente";
        passwordInput.value = "";
        passwordInput.required = false;
        passwordWrapper.classList.add("d-none");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function eliminar(id) {
        const ok = window.confirm("¿Eliminar este usuario?");
        if (!ok) return;
        await fetchJson(`/api/personas/${id}`, { method: "DELETE" });
        showFeedback("Usuario eliminado.", "success");
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
