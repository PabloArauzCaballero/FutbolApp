const logger = require('../logs/logger');

function errorHandler(err, req, res, next) {
  logger.error({ error: err.message, url: req.originalUrl }, 'Error');
  
  if (req.path.startsWith('/api')) {
    return res.status(500).json({ 
      ok: false, 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno' 
    });
  }
  
  req.session.error = 'Ocurrió un error inesperado';
  res.redirect('back');
}

function notFoundHandler(req, res, next) {
  // Si no está autenticado y no es API, redirigir al login
  if (!req.session?.user && !req.path.startsWith('/api')) {
    logger.info({ url: req.originalUrl }, 'Redirigiendo a login (no autenticado)');
    return res.redirect('/auth/login');
  }
  
  logger.warn({ url: req.originalUrl }, '404 No encontrado');
  
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ ok: false, error: 'Recurso no encontrado' });
  }
  
  res.status(404).render('errors/404', { 
    title: 'No encontrado', 
    user: req.session?.user || null 
  });
}

module.exports = { errorHandler, notFoundHandler };
