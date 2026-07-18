import { Router } from 'express';
import { VehicleController } from './vehicles.controller';
import { authenticate } from '../../middleware/auth';
import { adminOnly } from '../../middleware/adminOnly';

/**
 * Vehicle Routes
 *
 * 📚 INTERVIEW EXPLANATION: Middleware Chain
 * ===========================================
 * Express processes middleware LEFT TO RIGHT.
 * router.delete('/:id', authenticate, adminOnly, controller.deleteVehicle)
 *                        ^^^^^^^^^^^  ^^^^^^^^^  ^^^^^^^^^^^^^^^^^^^^^^^^
 *                        1st: verify  2nd: check  3rd: actual handler
 *                        JWT token    role=ADMIN
 *
 * If ANY middleware calls res.json() without calling next(),
 * the chain STOPS — the route handler never runs.
 * This is how we block unauthorized requests early.
 *
 * Route: /api/vehicles (prefix set in app.ts)
 */

const router = Router();
const vehicleController = new VehicleController();

// IMPORTANT: /search must come BEFORE /:id
// Why? Express matches routes TOP TO BOTTOM.
// If /:id comes first, "search" would be treated as an ID!
router.get('/search', authenticate, vehicleController.searchVehicles);

// GET /api/vehicles — any logged-in user can view
router.get('/', authenticate, vehicleController.getAllVehicles);

// POST /api/vehicles — admin only can add
router.post('/', authenticate, adminOnly, vehicleController.createVehicle);

// PUT /api/vehicles/:id — admin only can update
router.put('/:id', authenticate, adminOnly, vehicleController.updateVehicle);

// DELETE /api/vehicles/:id — admin only can delete
router.delete('/:id', authenticate, adminOnly, vehicleController.deleteVehicle);

// POST /api/vehicles/:id/purchase — any logged-in user can purchase
router.post('/:id/purchase', authenticate, vehicleController.purchaseVehicle);

// POST /api/vehicles/:id/restock — admin only can restock
router.post('/:id/restock', authenticate, adminOnly, vehicleController.restockVehicle);

export default router;
