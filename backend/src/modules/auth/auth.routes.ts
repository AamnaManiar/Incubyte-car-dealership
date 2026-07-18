import { Router } from 'express';
import { AuthController } from './auth.controller';

/**
 * Auth Routes
 *
 * 📚 INTERVIEW EXPLANATION: Express Router
 * =========================================
 * Router groups related routes together.
 * This router handles everything at /api/auth/...
 *
 * Express Router is like a "mini application" that only handles
 * a specific subset of routes. It makes code modular — each feature
 * has its own router file.
 *
 * These routes are PUBLIC (no authentication required).
 * Anyone can call them — that's how you get your first token!
 */

const router = Router();
const authController = new AuthController();

// POST /api/auth/register
// Public: Register a new user account
router.post('/register', authController.register);

// POST /api/auth/login
// Public: Login and receive a JWT token
router.post('/login', authController.login);

export default router;
