function getService(moduleName){
    const repository = require('./repository')(moduleName);

    async function crear(payload) {
        return repository.crear(payload);
    }

    async function modificar(id, payload) {
        return repository.modificar(id, payload);
    }

    async function eliminar(id) {
        return repository.eliminar(id);
    }

    async function obtener(id) {
        return repository.obtenerPorId(id);
    }

    async function listar(pagination) {
        return repository.listar(pagination);
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