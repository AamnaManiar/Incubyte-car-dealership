/**
 * AUTH SERVICE TESTS
 *
 * 📚 TDD EXPLANATION — "Red → Green → Refactor"
 * ================================================
 * RED:    Write this test file FIRST. Tests will FAIL because
 *         auth.service.ts doesn't exist yet. This is intentional!
 *         Failing tests = "red" phase.
 *
 * GREEN:  Implement auth.service.ts to make ALL these tests pass.
 *         Minimum code needed to pass. Don't over-engineer.
 *
 * REFACTOR: Clean up the code while keeping tests green.
 *
 * WHY TDD? It forces you to think about WHAT your code should do
 * before HOW it does it. Your tests become living documentation.
 */

import { AuthService } from './auth.service';
import prisma from '../../utils/prismaClient';
import bcrypt from 'bcryptjs';

// 📚 MOCKING: We don't want tests to touch a real database.
// jest.mock() replaces the real module with a fake version.
// This makes tests:
//   - Fast (no DB roundtrip)
//   - Isolated (tests don't affect each other)
//   - Predictable (we control what the DB "returns")
jest.mock('../../utils/prismaClient', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Cast to access jest mock methods
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('AuthService', () => {
  let authService: AuthService;

  // Run before all tests
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  // Run before each test — create a fresh service instance
  beforeEach(() => {
    authService = new AuthService();
    // Clear all mock call history between tests
    jest.clearAllMocks();
  });

  // ============================================================
  // REGISTER TESTS
  // ============================================================
  describe('register', () => {
    it('should register a new user and return a JWT token', async () => {
      // ARRANGE: Set up mock data
      const email = 'test@example.com';
      const password = 'password123';

      // Tell our fake prisma: "when findUnique is called, return null"
      // (null = user doesn't exist yet = good, we can register)
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Tell our fake prisma: "when create is called, return this user object"
      (mockPrisma.user.create as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email,
        password: 'hashed-password',
        role: 'USER',
        createdAt: new Date(),
      });

      // ACT: Call the function we're testing
      const result = await authService.register(email, password);

      // ASSERT: Check the result is what we expect
      expect(result).toHaveProperty('token');       // Should return a token
      expect(result).toHaveProperty('user');        // And user info
      expect(result.user.email).toBe(email);        // Correct email
      expect(result.user).not.toHaveProperty('password'); // Never expose password!
    });

    it('should throw an error if email is already registered', async () => {
      // ARRANGE: Mock DB to return an existing user
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'existing-user',
        email: 'test@example.com',
        password: 'hashed',
        role: 'USER',
        createdAt: new Date(),
      });

      // ACT & ASSERT: Expect the register call to throw
      await expect(
        authService.register('test@example.com', 'password123')
      ).rejects.toThrow('Email already in use');
    });

    it('should hash the password before saving to database', async () => {
      // ARRANGE
      const plainPassword = 'mypassword123';
      let savedHashedPassword = '';

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (mockPrisma.user.create as jest.Mock).mockImplementation(({ data }) => {
        savedHashedPassword = data.password; // Capture what was saved
        return Promise.resolve({ id: '1', email: data.email, password: data.password, role: 'USER', createdAt: new Date() });
      });

      // ACT
      await authService.register('new@example.com', plainPassword);

      // ASSERT: The saved password should NOT be the plain text
      expect(savedHashedPassword).not.toBe(plainPassword);
      // And it should be a valid bcrypt hash
      const isValidHash = await bcrypt.compare(plainPassword, savedHashedPassword);
      expect(isValidHash).toBe(true);
    });
  });

  // ============================================================
  // LOGIN TESTS
  // ============================================================
  describe('login', () => {
    it('should return a JWT token for valid credentials', async () => {
      // ARRANGE: Create a hashed password to simulate DB storage
      const plainPassword = 'password123';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'USER',
        createdAt: new Date(),
      });

      // ACT
      const result = await authService.login('test@example.com', plainPassword);

      // ASSERT
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw an error for non-existent email', async () => {
      // ARRANGE: User not found
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      // ACT & ASSERT
      await expect(
        authService.login('nobody@example.com', 'password123')
      ).rejects.toThrow('Invalid email or password');
    });

    it('should throw an error for wrong password', async () => {
      // ARRANGE: User exists but password is wrong
      const hashedPassword = await bcrypt.hash('correctpassword', 10);
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'USER',
        createdAt: new Date(),
      });

      // ACT & ASSERT
      await expect(
        authService.login('test@example.com', 'wrongpassword')
      ).rejects.toThrow('Invalid email or password');
    });
  });
});
