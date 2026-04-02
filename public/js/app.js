(function () {
    const config = window.__CRUD_CONFIG__;

    if (!config) {
        return;
    }

    const form = document.getElementById('crud-form');
    const tableBody = document.getElementById('crud-table-body');
    const feedback = document.getElementById('crud-feedback');
    const modeBadge = document.getElementById('crud-mode-badge');
    const submitButton = document.getElementById('crud-submit-button');
    const cancelEditButton = document.getElementById('crud-cancel-edit');
    const reloadButton = document.getElementById('crud-reload-button');
    const listSummary = document.getElementById('crud-list-summary');
    const currentIdInput = document.getElementById('crud-current-id');

    let currentItems = [];
    let editingId = null;

    function getByPath(object, path) {
        if (!path) {
            return object;
        }

        return path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), object);
    }

    function showFeedback(message, type = 'success') {
        if (!feedback) {
            return;
        }

        feedback.className = `alert alert-${type}`;
        feedback.textContent = message;
        feedback.classList.remove('d-none');
    }

    function hideFeedback() {
        if (!feedback) {
            return;
        }

        feedback.classList.add('d-none');
        feedback.textContent = '';
    }

    function normalizeValue(field, rawValue) {
        if (field.type === 'number') {
            if (rawValue === '') return null;
            return Number(rawValue);
        }

        if (field.type === 'select' && field.options && rawValue !== '') {
            const lowerValue = String(rawValue).toLowerCase();
            if (lowerValue === 'true') return true;
            if (lowerValue === 'false') return false;
        }

        return rawValue;
    }

    function buildPayload(mode) {
        const payload = {};

        for (const field of config.formFields) {
            if (mode === 'edit' && field.onlyOnCreate) {
                continue;
            }

            const input = form.elements[field.name];
            if (!input) {
                continue;
            }

            const rawValue = input.value;
            if (rawValue === '' && !field.required) {
                continue;
            }

            payload[field.name] = normalizeValue(field, rawValue);
        }

        return payload;
    }

    function getApiPath(template, id) {
        return template.replace(':id', id);
    }

    async function fetchJson(url, options = {}) {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {}),
            },
            credentials: 'same-origin',
            ...options,
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.message || 'Ocurrió un error en la solicitud.');
        }

        return data;
    }

    async function populateSelectField(field) {
        const select = form.elements[field.name];
        if (!select) {
            return;
        }

        if (!field.dataSource) {
            return;
        }

        try {
            const response = await fetchJson(field.dataSource.url, { method: 'GET' });
            const items = getByPath(response, field.dataSource.responsePath) || [];
            const previousValue = select.value;

            select.innerHTML = '<option value="">Seleccione una opción</option>';

            for (const item of items) {
                const option = document.createElement('option');
                option.value = item[field.dataSource.valueKey];
                const labelValue = item[field.dataSource.labelKey];
                option.textContent = `${item[field.dataSource.valueKey]} - ${labelValue}`;
                select.appendChild(option);
            }

            if (previousValue) {
                select.value = previousValue;
            }
        } catch (error) {
            showFeedback(`No se pudo cargar ${field.label.toLowerCase()}: ${error.message}`, 'warning');
        }
    }

    async function populateDynamicFields() {
        const asyncTasks = config.formFields
            .filter((field) => field.type === 'select' && field.dataSource)
            .map((field) => populateSelectField(field));

        await Promise.all(asyncTasks);
    }

    function setFormMode(mode) {
        const isEditMode = mode === 'edit';
        modeBadge.textContent = isEditMode ? 'Modo edición' : 'Modo creación';
        modeBadge.className = `badge ${isEditMode ? 'text-bg-warning' : 'text-bg-primary'}`;
        submitButton.textContent = isEditMode ? 'Actualizar' : 'Guardar';
        cancelEditButton.classList.toggle('d-none', !isEditMode);

        document.querySelectorAll('[data-only-on-create="true"]').forEach((wrapper) => {
            wrapper.classList.toggle('d-none', isEditMode);
            wrapper.querySelectorAll('input, select, textarea').forEach((element) => {
                element.disabled = isEditMode;
            });
        });
    }

    function resetForm() {
        form.reset();
        editingId = null;
        currentIdInput.value = '';
        hideFeedback();
        setFormMode('create');
    }

    function fillForm(item) {
        resetForm();
        editingId = item[config.primaryKey];
        currentIdInput.value = editingId;

        for (const field of config.formFields) {
            if (field.onlyOnCreate) {
                continue;
            }

            const input = form.elements[field.name];
            if (!input) {
                continue;
            }

            const value = item[field.name];

            if (field.type === 'select') {
                if (typeof value === 'boolean') {
                    input.value = String(value);
                } else {
                    input.value = value == null ? '' : String(value);
                }
                continue;
            }

            input.value = value == null ? '' : value;
        }

        setFormMode('edit');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function formatCellValue(value) {
        if (typeof value === 'boolean') {
            return value ? 'Sí' : 'No';
        }

        if (value == null || value === '') {
            return '—';
        }

        return String(value);
    }

    function renderTable(items) {
        currentItems = items;
        tableBody.innerHTML = '';

        if (!items.length) {
            tableBody.innerHTML = '<tr><td colspan="99" class="text-center text-muted py-4">No hay registros para mostrar.</td></tr>';
            listSummary.textContent = '0 registros cargados';
            return;
        }

        for (const item of items) {
            const tr = document.createElement('tr');

            for (const column of config.tableColumns) {
                const td = document.createElement('td');
                td.textContent = formatCellValue(item[column.key]);
                tr.appendChild(td);
            }

            const actionsTd = document.createElement('td');
            actionsTd.className = 'text-nowrap';
            actionsTd.innerHTML = `
                <button type="button" class="btn btn-sm btn-outline-primary me-2" data-action="edit" data-id="${item[config.primaryKey]}">Editar</button>
                <button type="button" class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${item[config.primaryKey]}">Eliminar</button>
            `;
            tr.appendChild(actionsTd);
            tableBody.appendChild(tr);
        }

        listSummary.textContent = `${items.length} registros cargados`;
    }

    async function loadItems() {
        hideFeedback();
        const separator = config.listApiPath.includes('?') ? '&' : '?';
        const url = `${config.listApiPath}${separator}offset=0&limit=${window.__APP_CONFIG__.defaultListLimit}`;
        const response = await fetchJson(url, { method: 'GET' });
        const items = getByPath(response, 'data.items') || [];
        renderTable(items);
    }

    async function handleSubmit(event) {
        event.preventDefault();
        hideFeedback();

        const mode = editingId ? 'edit' : 'create';
        const payload = buildPayload(mode);

        if (mode === 'create') {
            await fetchJson(config.createApiPath, {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            showFeedback('Registro creado correctamente.');
        } else {
            await fetchJson(getApiPath(config.updateApiPath, editingId), {
                method: 'PATCH',
                body: JSON.stringify(payload),
            });
            showFeedback('Registro actualizado correctamente.');
        }

        await populateDynamicFields();
        await loadItems();
        resetForm();
    }

    async function handleDelete(id) {
        const accepted = window.confirm('¿Seguro que deseas eliminar este registro?');
        if (!accepted) {
            return;
        }

        await fetchJson(getApiPath(config.deleteApiPath, id), {
            method: 'DELETE',
        });

        showFeedback('Registro eliminado correctamente.');
        await loadItems();
        if (editingId && String(editingId) === String(id)) {
            resetForm();
        }
    }

    tableBody.addEventListener('click', async (event) => {
        const target = event.target.closest('button[data-action]');
        if (!target) {
            return;
        }

        const { action, id } = target.dataset;
        const item = currentItems.find((row) => String(row[config.primaryKey]) === String(id));

        if (!item) {
            showFeedback('No se encontró el registro seleccionado.', 'warning');
            return;
        }

        if (action === 'edit') {
            fillForm(item);
            return;
        }

        if (action === 'delete') {
            try {
                await handleDelete(id);
            } catch (error) {
                showFeedback(error.message, 'danger');
            }
        }
    });

    form.addEventListener('submit', async (event) => {
        try {
            await handleSubmit(event);
        } catch (error) {
            showFeedback(error.message, 'danger');
        }
    });

    cancelEditButton.addEventListener('click', () => {
        resetForm();
    });

    reloadButton.addEventListener('click', async () => {
        try {
            await populateDynamicFields();
            await loadItems();
            showFeedback('Datos recargados correctamente.');
        } catch (error) {
            showFeedback(error.message, 'danger');
        }
    });

    window.addEventListener('DOMContentLoaded', async () => {
        try {
            setFormMode('create');
            await populateDynamicFields();
            await loadItems();
        } catch (error) {
            showFeedback(error.message, 'danger');
        }
    });
})();
