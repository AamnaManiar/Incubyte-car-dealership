import { Response } from 'express';
import { VehicleService } from './vehicles.service';
import { AuthenticatedRequest } from '../../middleware/auth';

/**
 * VehicleController
 *
 * 📚 INTERVIEW EXPLANATION:
 * - Reads from req.params (URL segments like /:id)
 * - Reads from req.query (URL query strings like ?make=Toyota)
 * - Reads from req.body (JSON request body)
 * - Calls VehicleService methods
 * - Sends appropriate HTTP status codes
 *
 * Common HTTP Status Codes to know:
 * 200 = OK (successful GET/PUT/DELETE)
 * 201 = Created (successful POST that created a resource)
 * 400 = Bad Request (invalid input from client)
 * 401 = Unauthorized (not logged in)
 * 403 = Forbidden (logged in but not allowed)
 * 404 = Not Found
 * 409 = Conflict (e.g., duplicate)
 * 500 = Internal Server Error (bug in our code)
 */
export class VehicleController {
  private vehicleService: VehicleService;

  constructor() {
    this.vehicleService = new VehicleService();
  }

  /**
   * POST /api/vehicles
   * Add a new vehicle to inventory (Admin only)
   */
  createVehicle = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { make, model, category, price, quantity } = req.body;

      if (!make || !model || !category || price === undefined || quantity === undefined) {
        res.status(400).json({
          success: false,
          message: 'All fields are required: make, model, category, price, quantity',
        });
        return;
      }

      const vehicle = await this.vehicleService.createVehicle({
        make,
        model,
        category,
        price: Number(price),
        quantity: Number(quantity),
      });

      res.status(201).json({ success: true, data: vehicle });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };

  /**
   * GET /api/vehicles
   * Get all vehicles
   */
  getAllVehicles = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const vehicles = await this.vehicleService.getAllVehicles();
      res.status(200).json({ success: true, data: vehicles });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };

  /**
   * GET /api/vehicles/search?make=Toyota&minPrice=10000
   * Search vehicles by filters
   *
   * 📚 req.query contains URL query string parameters
   * e.g. /search?make=Toyota&maxPrice=30000
   * gives req.query = { make: 'Toyota', maxPrice: '30000' }
   * Note: all query params come as STRINGS — we must convert numbers!
   */
  searchVehicles = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { make, model, category, minPrice, maxPrice } = req.query;

      const vehicles = await this.vehicleService.searchVehicles({
        make: make as string | undefined,
        model: model as string | undefined,
        category: category as string | undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
      });

      res.status(200).json({ success: true, data: vehicles });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };

  /**
   * PUT /api/vehicles/:id
   * Update vehicle details (Admin only)
   */
  updateVehicle = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // req.params.id = the :id part of the URL
      const { id } = req.params;
      const vehicle = await this.vehicleService.updateVehicle(id as string, req.body);
      res.status(200).json({ success: true, data: vehicle });
    } catch (error) {
      const err = error as Error;
      if (err.message === 'Vehicle not found') {
        res.status(404).json({ success: false, message: err.message });
        return;
      }
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };

  /**
   * DELETE /api/vehicles/:id
   * Delete a vehicle (Admin only)
   */
  deleteVehicle = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.vehicleService.deleteVehicle(id as string);
      res.status(200).json({ success: true, message: 'Vehicle deleted successfully' });
    } catch (error) {
      const err = error as Error;
      if (err.message === 'Vehicle not found') {
        res.status(404).json({ success: false, message: err.message });
        return;
      }
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };

  /**
   * POST /api/vehicles/:id/purchase
   * Purchase a vehicle (decreases quantity)
   */
  purchaseVehicle = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const vehicle = await this.vehicleService.purchaseVehicle(id as string);
      res.status(200).json({
        success: true,
        message: 'Vehicle purchased successfully',
        data: vehicle,
      });
    } catch (error) {
      const err = error as Error;
      if (err.message === 'Vehicle not found') {
        res.status(404).json({ success: false, message: err.message });
        return;
      }
      if (err.message === 'Vehicle is out of stock') {
        res.status(400).json({ success: false, message: err.message });
        return;
      }
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };

  /**
   * POST /api/vehicles/:id/restock
   * Restock a vehicle (Admin only)
   */
  restockVehicle = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { amount } = req.body;

      if (!amount || isNaN(Number(amount))) {
        res.status(400).json({ success: false, message: 'Amount is required and must be a number' });
        return;
      }

      const vehicle = await this.vehicleService.restockVehicle(id as string, Number(amount));
      res.status(200).json({
        success: true,
        message: `Vehicle restocked by ${amount} units`,
        data: vehicle,
      });
    } catch (error) {
      const err = error as Error;
      if (err.message === 'Vehicle not found') {
        res.status(404).json({ success: false, message: err.message });
        return;
      }
      if (err.message === 'Restock amount must be a positive number') {
        res.status(400).json({ success: false, message: err.message });
        return;
      }
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };
}
