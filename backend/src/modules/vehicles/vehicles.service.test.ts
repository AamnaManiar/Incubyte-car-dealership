/**
 * VEHICLE SERVICE TESTS
 *
 * 📚 TDD Pattern: RED → GREEN → REFACTOR
 *
 * These tests define the EXPECTED BEHAVIOR of our VehicleService.
 * We write these BEFORE implementing the service.
 *
 * Notice how the tests read like a specification:
 * "it should create a vehicle"
 * "it should decrease quantity on purchase"
 * This makes tests self-documenting!
 */

import { VehicleService } from './vehicles.service';
import prisma from '../../utils/prismaClient';

// Mock Prisma — no real database needed in unit tests
jest.mock('../../utils/prismaClient', () => ({
  __esModule: true,
  default: {
    vehicle: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

// Helper: a sample vehicle object to reuse across tests
const sampleVehicle = {
  id: 'vehicle-abc',
  make: 'Toyota',
  model: 'Camry',
  category: 'Sedan',
  price: 25000,
  quantity: 5,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('VehicleService', () => {
  let vehicleService: VehicleService;

  beforeEach(() => {
    vehicleService = new VehicleService();
    jest.clearAllMocks();
  });

  // ============================================================
  // CREATE VEHICLE
  // ============================================================
  describe('createVehicle', () => {
    it('should create a vehicle and return it', async () => {
      // ARRANGE
      (mockPrisma.vehicle.create as jest.Mock).mockResolvedValue(sampleVehicle);

      // ACT
      const result = await vehicleService.createVehicle({
        make: 'Toyota',
        model: 'Camry',
        category: 'Sedan',
        price: 25000,
        quantity: 5,
      });

      // ASSERT
      expect(result).toEqual(sampleVehicle);
      expect(mockPrisma.vehicle.create).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================
  // GET ALL VEHICLES
  // ============================================================
  describe('getAllVehicles', () => {
    it('should return a list of all vehicles', async () => {
      // ARRANGE
      const vehicles = [sampleVehicle, { ...sampleVehicle, id: 'vehicle-xyz', make: 'Honda' }];
      (mockPrisma.vehicle.findMany as jest.Mock).mockResolvedValue(vehicles);

      // ACT
      const result = await vehicleService.getAllVehicles();

      // ASSERT
      expect(result).toHaveLength(2);
      expect(result[0].make).toBe('Toyota');
      expect(result[1].make).toBe('Honda');
    });
  });

  // ============================================================
  // SEARCH VEHICLES
  // ============================================================
  describe('searchVehicles', () => {
    it('should search vehicles by make', async () => {
      // ARRANGE
      (mockPrisma.vehicle.findMany as jest.Mock).mockResolvedValue([sampleVehicle]);

      // ACT
      const result = await vehicleService.searchVehicles({ make: 'Toyota' });

      // ASSERT
      expect(result).toHaveLength(1);
      expect(result[0].make).toBe('Toyota');
      // Verify findMany was called with a "where" clause containing make
      expect(mockPrisma.vehicle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            make: expect.objectContaining({ contains: 'Toyota' }),
          }),
        })
      );
    });

    it('should filter vehicles by price range', async () => {
      // ARRANGE
      (mockPrisma.vehicle.findMany as jest.Mock).mockResolvedValue([sampleVehicle]);

      // ACT
      const result = await vehicleService.searchVehicles({ minPrice: 20000, maxPrice: 30000 });

      // ASSERT
      expect(result).toHaveLength(1);
      expect(mockPrisma.vehicle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            price: expect.objectContaining({ gte: 20000, lte: 30000 }),
          }),
        })
      );
    });
  });

  // ============================================================
  // UPDATE VEHICLE
  // ============================================================
  describe('updateVehicle', () => {
    it('should update a vehicle and return the updated data', async () => {
      // ARRANGE
      const updatedVehicle = { ...sampleVehicle, price: 27000 };
      (mockPrisma.vehicle.findUnique as jest.Mock).mockResolvedValue(sampleVehicle);
      (mockPrisma.vehicle.update as jest.Mock).mockResolvedValue(updatedVehicle);

      // ACT
      const result = await vehicleService.updateVehicle('vehicle-abc', { price: 27000 });

      // ASSERT
      expect(result.price).toBe(27000);
    });

    it('should throw if vehicle does not exist', async () => {
      // ARRANGE
      (mockPrisma.vehicle.findUnique as jest.Mock).mockResolvedValue(null);

      // ACT & ASSERT
      await expect(
        vehicleService.updateVehicle('nonexistent-id', { price: 999 })
      ).rejects.toThrow('Vehicle not found');
    });
  });

  // ============================================================
  // PURCHASE (the core business logic!)
  // ============================================================
  describe('purchaseVehicle', () => {
    it('should decrease quantity by 1 when purchasing', async () => {
      // ARRANGE: Vehicle is in stock (quantity = 5)
      (mockPrisma.vehicle.findUnique as jest.Mock).mockResolvedValue(sampleVehicle);
      (mockPrisma.vehicle.update as jest.Mock).mockResolvedValue({
        ...sampleVehicle,
        quantity: 4, // decreased by 1
      });

      // ACT
      const result = await vehicleService.purchaseVehicle('vehicle-abc');

      // ASSERT
      expect(result.quantity).toBe(4);
      // Verify update was called with quantity decreased by 1
      expect(mockPrisma.vehicle.update).toHaveBeenCalledWith({
        where: { id: 'vehicle-abc' },
        data: { quantity: 4 }, // 5 - 1 = 4
      });
    });

    it('should throw an error when vehicle is out of stock', async () => {
      // ARRANGE: Vehicle quantity is 0 (out of stock)
      const outOfStockVehicle = { ...sampleVehicle, quantity: 0 };
      (mockPrisma.vehicle.findUnique as jest.Mock).mockResolvedValue(outOfStockVehicle);

      // ACT & ASSERT
      await expect(
        vehicleService.purchaseVehicle('vehicle-abc')
      ).rejects.toThrow('Vehicle is out of stock');
    });

    it('should throw if vehicle does not exist', async () => {
      // ARRANGE
      (mockPrisma.vehicle.findUnique as jest.Mock).mockResolvedValue(null);

      // ACT & ASSERT
      await expect(
        vehicleService.purchaseVehicle('nonexistent-id')
      ).rejects.toThrow('Vehicle not found');
    });
  });

  // ============================================================
  // RESTOCK
  // ============================================================
  describe('restockVehicle', () => {
    it('should increase quantity by the given amount', async () => {
      // ARRANGE
      (mockPrisma.vehicle.findUnique as jest.Mock).mockResolvedValue(sampleVehicle);
      (mockPrisma.vehicle.update as jest.Mock).mockResolvedValue({
        ...sampleVehicle,
        quantity: 15, // 5 + 10
      });

      // ACT
      const result = await vehicleService.restockVehicle('vehicle-abc', 10);

      // ASSERT
      expect(result.quantity).toBe(15);
      expect(mockPrisma.vehicle.update).toHaveBeenCalledWith({
        where: { id: 'vehicle-abc' },
        data: { quantity: 15 }, // 5 + 10
      });
    });

    it('should throw if restock amount is not positive', async () => {
      await expect(
        vehicleService.restockVehicle('vehicle-abc', 0)
      ).rejects.toThrow('Restock amount must be a positive number');

      await expect(
        vehicleService.restockVehicle('vehicle-abc', -5)
      ).rejects.toThrow('Restock amount must be a positive number');
    });
  });

  // ============================================================
  // DELETE VEHICLE
  // ============================================================
  describe('deleteVehicle', () => {
    it('should delete a vehicle successfully', async () => {
      // ARRANGE
      (mockPrisma.vehicle.findUnique as jest.Mock).mockResolvedValue(sampleVehicle);
      (mockPrisma.vehicle.delete as jest.Mock).mockResolvedValue(sampleVehicle);

      // ACT
      await vehicleService.deleteVehicle('vehicle-abc');

      // ASSERT
      expect(mockPrisma.vehicle.delete).toHaveBeenCalledWith({
        where: { id: 'vehicle-abc' },
      });
    });

    it('should throw if vehicle not found', async () => {
      // ARRANGE
      (mockPrisma.vehicle.findUnique as jest.Mock).mockResolvedValue(null);

      // ACT & ASSERT
      await expect(
        vehicleService.deleteVehicle('nonexistent-id')
      ).rejects.toThrow('Vehicle not found');
    });
  });
});
