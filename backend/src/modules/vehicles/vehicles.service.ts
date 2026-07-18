import prisma from '../../utils/prismaClient';

/**
 * Input type for creating a vehicle
 * TypeScript interface defines the shape of valid input data
 */
export interface CreateVehicleInput {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
}

/**
 * Input type for searching vehicles
 * All fields are optional — search by any combination
 */
export interface SearchVehicleInput {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

/**
 * VehicleService
 *
 * 📚 INTERVIEW EXPLANATION: This service handles all vehicle
 * business logic — creating, reading, searching, purchasing, restocking.
 *
 * Key design decisions:
 * - findVehicleOrThrow() is a private helper to avoid code repetition (DRY principle)
 * - Each method throws descriptive errors (controller catches & maps to HTTP status)
 * - Prisma's case-insensitive "contains" allows flexible text search
 */
export class VehicleService {
  /**
   * Private helper — find vehicle by ID or throw
   * 📚 DRY Principle: "Don't Repeat Yourself"
   * Used in update, delete, purchase, restock to avoid repeating the same check
   */
  private async findVehicleOrThrow(id: string) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }
    return vehicle;
  }

  /**
   * Create a new vehicle in the inventory
   */
  async createVehicle(data: CreateVehicleInput) {
    return prisma.vehicle.create({ data });
  }

  /**
   * Get all vehicles — sorted newest first
   */
  async getAllVehicles() {
    return prisma.vehicle.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Search vehicles by various criteria
   *
   * 📚 INTERVIEW EXPLANATION: Prisma WHERE Clause
   * =================================================
   * Prisma builds safe SQL WHERE clauses from JavaScript objects.
   * "contains" = LIKE '%value%' in SQL (partial match)
   * "mode: insensitive" = case-insensitive match (not supported in SQLite, omitted)
   * "gte" = >= (greater than or equal)
   * "lte" = <= (less than or equal)
   *
   * We only add a filter if the user actually passed that query param.
   * This allows flexible "search by any combination" behavior.
   */
  async searchVehicles(filters: SearchVehicleInput) {
    const where: any = {};

    if (filters.make) {
      where.make = { contains: filters.make };
    }
    if (filters.model) {
      where.model = { contains: filters.model };
    }
    if (filters.category) {
      where.category = { contains: filters.category };
    }
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
      if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
    }

    return prisma.vehicle.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  /**
   * Update vehicle details (admin only)
   */
  async updateVehicle(id: string, data: Partial<CreateVehicleInput>) {
    // Throws if not found
    await this.findVehicleOrThrow(id);

    return prisma.vehicle.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a vehicle from inventory (admin only)
   */
  async deleteVehicle(id: string) {
    await this.findVehicleOrThrow(id);

    return prisma.vehicle.delete({ where: { id } });
  }

  /**
   * Purchase a vehicle — decrease quantity by 1
   *
   * 📚 CORE BUSINESS LOGIC:
   * 1. Find vehicle (throw if not found)
   * 2. Check if in stock (throw if quantity = 0)
   * 3. Decrease quantity by 1
   *
   * In production, this would be inside a database TRANSACTION
   * to prevent race conditions (two people buying the last car simultaneously).
   * For this MVP, sequential check + update is sufficient.
   */
  async purchaseVehicle(id: string) {
    const vehicle = await this.findVehicleOrThrow(id);

    if (vehicle.quantity <= 0) {
      throw new Error('Vehicle is out of stock');
    }

    return prisma.vehicle.update({
      where: { id },
      data: { quantity: vehicle.quantity - 1 },
    });
  }

  /**
   * Restock a vehicle — increase quantity (admin only)
   * @param id - Vehicle ID
   * @param amount - How many units to add (must be positive)
   */
  async restockVehicle(id: string, amount: number) {
    // Validate input before touching the database
    if (amount <= 0) {
      throw new Error('Restock amount must be a positive number');
    }

    const vehicle = await this.findVehicleOrThrow(id);

    return prisma.vehicle.update({
      where: { id },
      data: { quantity: vehicle.quantity + amount },
    });
  }
}
