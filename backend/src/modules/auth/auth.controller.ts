import { Request, Response } from 'express';
import { AuthService } from './auth.service';

/**
 * AuthController
 *
 * 📚 INTERVIEW EXPLANATION: Controller Layer Pattern
 * ===================================================
 * Controllers handle HTTP concerns ONLY:
 *   1. Read data from the request (body, params, headers)
 *   2. Call the appropriate Service method
 *   3. Send back an HTTP response (status code + JSON)
 *
 * Controllers should NOT contain business logic.
 * That belongs in the Service layer.
 *
 * Think of it like a restaurant:
 *   - Controller = Waiter (takes order, delivers food)
 *   - Service    = Kitchen (actually prepares the food)
 *   - Database   = Pantry (stores ingredients)
 */
export class AuthController {
  private authService: AuthService;

  constructor() {
    // Create an instance of the service to use
    this.authService = new AuthService();
  }

  /**
   * POST /api/auth/register
   * Register a new user account
   */
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      // 1. Extract data from request body
      const { email, password } = req.body;

      // 2. Basic validation
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email and password are required',
        });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters',
        });
        return;
      }

      // 3. Call service — let it handle the actual logic
      const result = await this.authService.register(email, password);

      // 4. Send success response
      // 201 = "Created" — HTTP standard for successful resource creation
      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: result,
      });
    } catch (error) {
      // 5. Handle errors from the service layer
      const err = error as Error;

      // 409 = Conflict (email already exists)
      if (err.message === 'Email already in use') {
        res.status(409).json({
          success: false,
          message: err.message,
        });
        return;
      }

      // 500 = Internal Server Error (unexpected error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };

  /**
   * POST /api/auth/login
   * Login and receive JWT token
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email and password are required',
        });
        return;
      }

      const result = await this.authService.login(email, password);

      // 200 = OK — standard success response
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      const err = error as Error;

      // 401 = Unauthorized (wrong credentials)
      if (err.message === 'Invalid email or password') {
        res.status(401).json({
          success: false,
          message: err.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };
}
