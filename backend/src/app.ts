import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load .env file into process.env FIRST (before anything else reads it)
dotenv.config();

// Import route modules
import authRoutes from './modules/auth/auth.routes';
import vehicleRoutes from './modules/vehicles/vehicles.routes';

/**
 * Express Application Setup
 *
 * 📚 INTERVIEW EXPLANATION: Why separate app.ts from index.ts?
 * ==============================================================
 * app.ts = The Express app configuration (routes, middleware)
 * index.ts = The server startup (listen on port)
 *
 * Why separate them?
 * - Tests can import 'app' WITHOUT starting the server
 * - Supertest uses the app object directly for testing
 * - Cleaner separation of concerns
 */
const app = express();

// ============================================================
// GLOBAL MIDDLEWARE
// These run for EVERY request, before hitting any route
// ============================================================

/**
 * CORS — Cross-Origin Resource Sharing
 * Allows our React frontend (localhost:5173) to call our API (localhost:5000)
 * Without this, browsers block cross-origin requests by default!
 *
 * 📚 INTERVIEW: What is CORS?
 * Browser security feature that blocks web pages from making requests
 * to a different domain/port than the one that served the page.
 * We configure it to allow our frontend's origin.
 */
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true, // Allow cookies if needed
}));

/**
 * express.json() — Body Parser
 * Parses JSON request bodies and makes them available as req.body
 * Without this, req.body would be undefined!
 */
app.use(express.json());

// ============================================================
// ROUTES
// Mount each router at its base path
// ============================================================

// Auth routes: POST /api/auth/register, POST /api/auth/login
app.use('/api/auth', authRoutes);

// Vehicle routes: GET /api/vehicles, POST /api/vehicles, etc.
app.use('/api/vehicles', vehicleRoutes);

// Health check endpoint — useful for deployment monitoring
// Returns 200 if the server is running
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Car Dealership API is running',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler — catch all unmatched routes
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

export default app;
