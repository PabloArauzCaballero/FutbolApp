const canchasModule = require('./canchas');
const tipoCanchaModule = require('./tipoCancha');
const horariosModule = require('./horarios');
const personasModule = require('./personas');
const resenasModule = require('./resenas');
const reservasModule = require('./reservas');
const authModule = require('./auth');
const frontendViewsModule = require('./frontendViews');

module.exports = [
  frontendViewsModule,
  canchasModule,
  tipoCanchaModule,
  horariosModule,
  personasModule,
  resenasModule,
  reservasModule,
  authModule,
];
