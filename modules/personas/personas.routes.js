const express = require('express');
const router = express.Router();
const { name } = require('./model.prototype');

const validator = require('../validators')[name];
const normalizer = require('../normalizers')[name];
const controller = require('../controller')(name, validator, normalizer);
const { renderTarget } = require('../../core/utils/renderTarget');

const render = renderTarget('shared/index', { moduleName: name });

router.get('/front', render);

router.patch('/:id', controller.modificar);
router.delete('/:id', controller.eliminar);
router.get('/:id', controller.obtenerPorId);
router.get('/', controller.listar);

module.exports = router;
