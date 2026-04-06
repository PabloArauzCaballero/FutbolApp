const { getModels } = require('./db.config');
const logger = require('../../logs/logger');
const { sha1Encode } = require('../text.utils');

async function seedDatabase() {
  try {
    // Obtener modelos después de que estén inicializados
    const { Usuario, TipoCancha, Cancha, Horario } = getModels();
    
    const existingUsers = await Usuario.count();
    if (existingUsers > 0) {
      logger.info('Base de datos ya poblada');
      return;
    }

    logger.info('Creando datos de prueba...');

    await Usuario.create({
      nombre: 'Administrador',
      email: 'admin@futbol.app',
      contrasena: sha1Encode('admin123'),
      rol: 'admin'
    });

    await Usuario.create({
      nombre: 'Cliente Prueba',
      email: 'client@futbol.app',
      contrasena: sha1Encode('client123'),
      rol: 'cliente'
    });

    const tipo5 = await TipoCancha.create({ nombre: 'Futbol 5' });
    const tipo7 = await TipoCancha.create({ nombre: 'Futbol 7' });
    const tipo11 = await TipoCancha.create({ nombre: 'Futbol 11' });

    const cancha1 = await Cancha.create({
      nombre: 'Cancha Principal 5',
      tipo_id: tipo5.id,
      precio_por_hora: 2500.00,
      estado: 'Activa'
    });

    await Cancha.create({
      nombre: 'Cancha Norte 7',
      tipo_id: tipo7.id,
      precio_por_hora: 3500.00,
      estado: 'Activa'
    });

    await Cancha.create({
      nombre: 'Estadio Central 11',
      tipo_id: tipo11.id,
      precio_por_hora: 8000.00,
      estado: 'Activa'
    });

    const today = new Date();
    for (let dia = 0; dia < 7; dia++) {
      const date = new Date(today);
      date.setDate(date.getDate() + dia);
      const fechaStr = date.toISOString().split('T')[0];

      for (let hora = 8; hora < 12; hora++) {
        await Horario.create({
          cancha_id: cancha1.id,
          fecha: fechaStr,
          hora_inicio: `${hora.toString().padStart(2, '0')}:00`,
          hora_fin: `${(hora + 1).toString().padStart(2, '0')}:00`,
          disponible: true
        });
      }
      
      for (let hora = 14; hora < 22; hora++) {
        await Horario.create({
          cancha_id: cancha1.id,
          fecha: fechaStr,
          hora_inicio: `${hora.toString().padStart(2, '0')}:00`,
          hora_fin: `${(hora + 1).toString().padStart(2, '0')}:00`,
          disponible: true
        });
      }
    }

    logger.info('✅ Datos de prueba creados');
    console.log('\n╔════════════════════════════════════╗');
    console.log('║      DATOS DE PRUEBA CREADOS       ║');
    console.log('╠════════════════════════════════════╣');
    console.log('║ Admin:  admin@futbol.app           ║');
    console.log('║         admin123                   ║');
    console.log('║                                    ║');
    console.log('║ Cliente: client@futbol.app         ║');
    console.log('║          client123                 ║');
    console.log('╚════════════════════════════════════╝\n');

  } catch (error) {
    logger.error(error, 'Error creando datos');
    throw error;
  }
}

module.exports = { seedDatabase };

if (require.main === module) {
  const { initDatabase } = require('./db.config');
  (async () => {
    try {
      await initDatabase();
      await seedDatabase();
      process.exit(0);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  })();
}
