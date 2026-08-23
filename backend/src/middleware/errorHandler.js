// backend/src/middleware/errorHandler.js
export function errorHandler(err, req, res, next) {
  const status = err.statusCode || err.status || 500;
  const isDev = process.env.NODE_ENV === 'development';

  console.error(`[ERROR] ${req.method} ${req.path} →`, err.message);
  if (isDev) console.error(err.stack);

  res.status(status).json({
    success: false,
    message: isDev ? err.message : 'An error occurred. Please try again.',
    ...(isDev && { stack: err.stack }),
  });
}

export function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}
