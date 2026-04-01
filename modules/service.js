function getService(moduleName) {
    const repository = require('./repository')(moduleName);

    async function crear(payload) {
        return repository.crear(payload);
    }

    async function modificar(payloadOrId, paramsOrPayload = {}) {
        if (typeof payloadOrId === 'number') {
            return repository.modificar(payloadOrId, paramsOrPayload);
        }

        const payload = payloadOrId ?? {};
        const params = paramsOrPayload ?? {};
        return repository.modificar(params.id, payload);
    }

    async function eliminar(id) {
        return repository.eliminar(id);
    }

    async function obtener(id) {
        return repository.obtenerPorId(id);
    }

    async function listar(params = {}, query = {}) {
        const pagination = typeof query === 'object' && query !== null && !Array.isArray(query)
            ? query
            : params;

        return repository.listar(pagination || {});
    }

    return {
        crear,
        modificar,
        eliminar,
        obtener,
        listar,
    };
}

module.exports = getService;
