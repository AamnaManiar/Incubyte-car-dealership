import app from './app';

/**
 * Server Entry Point
 * This file is ONLY responsible for starting the HTTP server.
 * All Express configuration is in app.ts.
 *
 * process.env.PORT lets hosting platforms (Heroku, Railway, etc.)
 * inject their own port via environment variable.
 * We fall back to 5000 for local development.
 */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚗 Car Dealership API running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`❤️  Engine check: http://localhost:${PORT}/engine-check`);
});