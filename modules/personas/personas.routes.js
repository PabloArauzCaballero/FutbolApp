const express = require('express');
const router = express.Router();
const { name } = require('./model.prototype');

const validator = require('../validators')[name];
const normalizer = require('../normalizers')[name];
const controller = require('../controller')(name, validator, normalizer);

router.post('/', controller.crear);
router.patch('/:id', controller.modificar);
router.delete('/:id', controller.eliminar);
router.get('/:id', controller.obtenerPorId);
router.get('/', controller.listar);

module.exports = router;
