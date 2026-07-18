import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../utils/prismaClient';

/**
 * AuthService
 *
 * 📚 INTERVIEW EXPLANATION: Service Layer Pattern
 * ================================================
 * The Service Layer contains the BUSINESS LOGIC.
 * It sits between the Controller (HTTP) and the Database (Prisma).
 *
 * Why separate services from controllers?
 * - Controllers handle HTTP stuff (request/response)
 * - Services handle business rules (validation, logic)
 * - Separation makes code testable and reusable
 *
 * Controller calls Service → Service calls Database
 */
export class AuthService {
  /**
   * Register a new user
   * @param email - User's email address
   * @param password - Plain text password (we'll hash it!)
   * @returns Object with JWT token and safe user data (no password)
   */
  async register(email: string, password: string) {
    // Step 1: Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Throw an error — the controller will catch this and send 400 response
      throw new Error('Email already in use');
    }

    // Step 2: Hash the password
    // NEVER store plain text passwords in your database!
    // bcrypt is a one-way hash — you can't reverse it to get the original
    // saltRounds=10 means bcrypt does 2^10 = 1024 hashing iterations (slow = secure)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Step 3: Save user to database
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'USER', // Default role for new registrations
      },
    });

    // Step 4: Generate JWT token
    const token = this.generateToken(user.id, user.role);

    // Step 5: Return token + user data (without password)
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Login an existing user
   * @param email - User's email
   * @param password - Plain text password to compare against stored hash
   * @returns Object with JWT token and safe user data
   */
  async login(email: string, password: string) {
    // Step 1: Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Step 2: Check if user exists AND password matches
    // Important: use a vague error message ("Invalid email or password")
    // Never tell attackers which one was wrong!
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // bcrypt.compare() hashes the input and compares to stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Step 3: Generate and return JWT token
    const token = this.generateToken(user.id, user.role);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Generate a JWT token
   * @param userId - The user's database ID
   * @param role - The user's role (USER or ADMIN)
   * @returns Signed JWT string
   *
   * 📚 INTERVIEW EXPLANATION:
   * jwt.sign(payload, secret, options) creates a token where:
   *   - payload: data to embed in the token (userId, role)
   *   - secret: your app's secret key to sign with
   *   - expiresIn: when the token expires (forces re-login)
   */
  private generateToken(userId: string, role: string): string {
    const secret = process.env.JWT_SECRET as string;
    return jwt.sign(
      { userId, role },  // Payload — stored inside the token
      secret,
      { expiresIn: '7d' }  // Token expires after 7 days
    );
  }
}
